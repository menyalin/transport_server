import mongoose from 'mongoose'
import ChangeLogService from '../changeLog/index.js'
import {
  DocsRegistry as DocsRegistryModel,
  Order as OrderModel,
  OrderInDocsRegistry as OrderInDocsRegistryModel,
} from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import { BadRequestError } from '../../helpers/errors.js'
import { getListPipeline } from './pipelines/getListPipeline.js'
import { getPickOrdersPipeline } from './pipelines/pickOrdersPipeline.js'
import getOrdersForRegistry from './getOrdersForRegistry.js'

class DocsRegistryService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
  }

  async deleteById({ id, user, company }) {
    const ordersInRegistry = await OrderInDocsRegistryModel.find({
      docsRegistry: id,
    }).lean()

    if (ordersInRegistry.length > 0)
      throw new BadRequestError(
        'Delete is not possible. orders refer to registry'
      )

    const data = await this.model.findByIdAndDelete(id)

    this.emitter(company, `${this.modelName}:deleted`, id)

    if (this.logService)
      await this.logService.add({
        docId: id,
        coll: this.modelName,
        opType: 'delete',
        user,
        company: company,
      })
    return data
  }

  async getById(id) {
    const docsRegistry = await this.model.findById(id).lean()

    const orders = await getOrdersForRegistry({
      docsRegistryId: docsRegistry._id.toString(),
    })

    docsRegistry.orders = orders
    return docsRegistry
  }

  async create({ body, user, company }) {
    if (!company) throw new BadRequestError('bad request params')
    const lastRegistry = await this.model.aggregate([
      { $match: { company: mongoose.Types.ObjectId(company) } },
      { $project: { number: '$number' } },
      { $sort: { number: -1 } },
      { $limit: 1 },
    ])

    if (!lastRegistry[0] || !lastRegistry[0].number) body.number = 1
    else body.number = lastRegistry[0].number + 1

    const data = await this.model.create({ ...body, company })

    if (this.logService)
      await this.logService.add({
        docId: data._id.toString(),
        coll: this.modelName,
        opType: 'create',
        user,
        company: data.company.toString(),
        body: JSON.stringify(data.toJSON()),
      })
    this.emitter(data.company.toString(), `${this.modelName}:created`, data)
    return data
  }

  async getList(params) {
    try {
      const pipeline = getListPipeline(params)
      const res = await this.model.aggregate(pipeline)
      return res[0] || []
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async addOrdersToRegistry({ company, orders, docsRegistryId }) {
    if (!orders || orders.length === 0)
      throw new BadRequestError(
        'DocsRegistryService:addOrdersToRegistry. missing required params'
      )
    const newObjectItems = orders.map((order) => ({
      order,
      docsRegistry: docsRegistryId,
      company,
    }))

    const newDocs = await OrderInDocsRegistryModel.create(newObjectItems)

    const addedOrders = await getOrdersForRegistry({
      orderIds: newDocs.map((i) => i.order.toString()),
    })

    // todo: получить рейсы в формате реестра рейсов и отправить сокетом
    this.emitter(company, 'orders:addedToRegistry', {
      orders: addedOrders,
      docsRegistry: docsRegistryId,
    })
    return newDocs
  }

  async removeOrdersFromRegistry({ company, orders, docsRegistryId }) {
    if (!orders || orders.length === 0)
      throw new BadRequestError(
        'DocsRegistryService:removeOrdersFromRegistry. missing required params'
      )
    const removedOrders = await OrderInDocsRegistryModel.deleteMany({
      company,
      order: { $in: orders },
      docsRegistry: docsRegistryId,
    })
    this.emitter(company, 'orders:removedFromRegistry', {
      orders,
      docsRegistry: docsRegistryId,
    })
    return removedOrders
  }

  async pickOrdersForRegistry({
    company,
    client,
    docStatus,
    onlySelectable,
    docsRegistryId,
    truck,
    driver,
  }) {
    if (!company || !docsRegistryId)
      throw new BadRequestError(
        'DocsRegistryService:pickOrdersForRegistry. missing required params'
      )
    console.log('onlySelectable: ', onlySelectable === 'true')
    const docsRegistry = await this.model
      .findById(docsRegistryId)
      .populate('client')
      .populate('client.placesForTransferDocs')

    const placeForTransferDocs = docsRegistry?.client?.placesForTransferDocs.find(
      (i) =>
        i.address.toString() === docsRegistry.placeForTransferDocs.toString()
    )
    const allowedAddresses = placeForTransferDocs?.allowedLoadingPoints.map(
      (i) => i.toString()
    )
    if (!docsRegistry)
      throw new BadRequestError(
        'DocsRegistryService:pickOrdersForRegistry. docsRegistry not found'
      )

    const pipeline = getPickOrdersPipeline({
      company,
      client,
      docStatus,
      truck,
      driver,
      onlySelectable: onlySelectable === 'true',
      allowedLoadingPoints: allowedAddresses,
    })

    const ordersForRegistry = await OrderModel.aggregate(pipeline)
    return ordersForRegistry
  }
}

export default new DocsRegistryService({
  model: DocsRegistryModel,
  emitter: emitTo,
  modelName: 'docsRegistry',
  logService: ChangeLogService,
})
