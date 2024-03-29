// @ts-nocheck
import mongoose from 'mongoose'
import ChangeLogService from '../changeLog'
import {
  DocsRegistry as DocsRegistryModel,
  Order as OrderModel,
  OrderInDocsRegistry as OrderInDocsRegistryModel,
  Agreement as AgreementModel,
} from '../../models'
import { emitTo } from '../../socket'

import { BadRequestError } from '../../helpers/errors'
import { getListPipeline } from './pipelines/getListPipeline'
import { getPickOrdersPipeline } from './pipelines/pickOrdersPipeline'
import getOrdersForRegistry from './getOrdersForRegistry'

class DocsRegistryService {
  constructor({ model, emitter, modelName, logService }) {
    this.model = model
    this.logService = logService
    this.emitter = emitter
    this.modelName = modelName
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
    if (docsRegistry.agreement) {
      const agreement = await AgreementModel.findById(
        docsRegistry.agreement
      ).lean()
      docsRegistry.executorName = agreement?.executorName
    }
    const orders = await getOrdersForRegistry({
      docsRegistryId: docsRegistry._id.toString(),
    })

    docsRegistry.orders = orders
    return docsRegistry
  }

  async updateOne({ id, body, user }) {
    const docsRegistry = await this.model
      .findByIdAndUpdate(id, body, {
        new: true,
      })
      .lean()
    if (this.logService)
      await this.logService.add({
        docId: docsRegistry._id.toString(),
        coll: this.modelName,
        opType: 'update',
        user,
        company: docsRegistry.company.toString(),
        body: JSON.stringify(docsRegistry),
      })

    const orders = await getOrdersForRegistry({
      docsRegistryId: docsRegistry._id.toString(),
    })
    docsRegistry.orders = orders

    this.emitter(
      docsRegistry.company.toString(),
      `${this.modelName}:updated`,
      docsRegistry
    )
    return docsRegistry
  }

  async create({ body, user, company }) {
    if (!company) throw new BadRequestError('bad request params')
    const lastRegistry = await this.model.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(company) } },
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
    loadingZone,
    period,
    search,
  }) {
    if (!company || !docsRegistryId)
      throw new BadRequestError(
        'DocsRegistryService:pickOrdersForRegistry. missing required params'
      )
    const docsRegistry = await this.model
      .findById(docsRegistryId)
      .populate('client')
      .populate('client.placesForTransferDocs')

    const placeForTransferDocs =
      docsRegistry?.client?.placesForTransferDocs.find(
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
      loadingZone,
      period,
      search,
      agreement: docsRegistry?.agreement.toString() || null,
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
