// import mongoose from 'mongoose'
import ChangeLogService from '../changeLog/index.js'
import {
  PaymentInvoice as PaymentInvoiceModel,
  // Order as OrderModel,
} from '../../models/index.js'
import { emitTo } from '../../socket/index.js'

import { BadRequestError } from '../../helpers/errors.js'
import { getListPipeline } from './pipelines/getListPipeline.js'
// import { getPickOrdersPipeline } from './pipelines/pickOrdersPipeline.js'
// import getOrdersForRegistry from './getOrdersForPaymentInvoice.js'

class PaymentInvoiceService {
  constructor({ model, emitter, modelName, logService }) {
    this.model = model
    this.logService = logService
    this.emitter = emitter
    this.modelName = modelName
  }

  // TODO:
  // async deleteById({ id, user, company }) {
  //   const ordersInRegistry = await OrderInDocsRegistryModel.find({
  //     docsRegistry: id,
  //   }).lean()

  //   if (ordersInRegistry.length > 0)
  //     throw new BadRequestError(
  //       'Delete is not possible. orders refer to registry'
  //     )

  //   const data = await this.model.findByIdAndDelete(id)

  //   this.emitter(company, `${this.modelName}:deleted`, id)

  //   if (this.logService)
  //     await this.logService.add({
  //       docId: id,
  //       coll: this.modelName,
  //       opType: 'delete',
  //       user,
  //       company: company,
  //     })
  //   return data
  // }

  //
  async getById(id) {
    const paymentInvoice = await this.model.findById(id).lean()

    // TODO:
    // const orders = await getOrdersForRegistry({
    //   docsRegistryId: docsRegistry._id.toString(),
    // })

    // docsRegistry.orders = orders
    return paymentInvoice
  }

  async updateOne({ id, body, user }) {
    const paymentInvoice = await this.model
      .findByIdAndUpdate(id, body, {
        new: true,
      })
      .lean()
    if (this.logService)
      await this.logService.add({
        docId: paymentInvoice._id.toString(),
        coll: this.modelName,
        opType: 'update',
        user,
        company: paymentInvoice.company.toString(),
        body: JSON.stringify(paymentInvoice),
      })

    // TODO:
    // const orders = await getOrdersForRegistry({
    //   docsRegistryId: docsRegistry._id.toString(),
    // })
    // docsRegistry.orders = orders

    this.emitter(
      paymentInvoice.company.toString(),
      `${this.modelName}:updated`,
      paymentInvoice
    )
    return paymentInvoice
  }

  async create({ body, user, company }) {
    if (!company) throw new BadRequestError('bad request params')

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

  // TODO:
  // async addOrdersToRegistry({ company, orders, docsRegistryId }) {
  //   if (!orders || orders.length === 0)
  //     throw new BadRequestError(
  //       'DocsRegistryService:addOrdersToRegistry. missing required params'
  //     )
  //   const newObjectItems = orders.map((order) => ({
  //     order,
  //     docsRegistry: docsRegistryId,
  //     company,
  //   }))

  //   const newDocs = await OrderInDocsRegistryModel.create(newObjectItems)

  //   const addedOrders = await getOrdersForRegistry({
  //     orderIds: newDocs.map((i) => i.order.toString()),
  //   })

  //   // todo: получить рейсы в формате реестра рейсов и отправить сокетом
  //   this.emitter(company, 'orders:addedToRegistry', {
  //     orders: addedOrders,
  //     docsRegistry: docsRegistryId,
  //   })
  //   return newDocs
  // }

  // TODO:
  // async removeOrdersFromRegistry({ company, orders, docsRegistryId }) {
  //   if (!orders || orders.length === 0)
  //     throw new BadRequestError(
  //       'DocsRegistryService:removeOrdersFromRegistry. missing required params'
  //     )
  //   const removedOrders = await OrderInDocsRegistryModel.deleteMany({
  //     company,
  //     order: { $in: orders },
  //     docsRegistry: docsRegistryId,
  //   })
  //   this.emitter(company, 'orders:removedFromRegistry', {
  //     orders,
  //     docsRegistry: docsRegistryId,
  //   })
  //   return removedOrders
  // }

  // TODO:
  //   async pickOrdersForRegistry({
  //     company,
  //     client,
  //     docStatus,
  //     onlySelectable,
  //     docsRegistryId,
  //     truck,
  //     driver,
  //     loadingZone,
  //     period,
  //     search,
  //   }) {
  //     if (!company || !docsRegistryId)
  //       throw new BadRequestError(
  //         'DocsRegistryService:pickOrdersForRegistry. missing required params'
  //       )
  //     const docsRegistry = await this.model
  //       .findById(docsRegistryId)
  //       .populate('client')
  //       .populate('client.placesForTransferDocs')

  //     const placeForTransferDocs = docsRegistry?.client?.placesForTransferDocs.find(
  //       (i) =>
  //         i.address.toString() === docsRegistry.placeForTransferDocs.toString()
  //     )
  //     const allowedAddresses = placeForTransferDocs?.allowedLoadingPoints.map(
  //       (i) => i.toString()
  //     )
  //     if (!docsRegistry)
  //       throw new BadRequestError(
  //         'DocsRegistryService:pickOrdersForRegistry. docsRegistry not found'
  //       )

  //     const pipeline = getPickOrdersPipeline({
  //       company,
  //       client,
  //       docStatus,
  //       truck,
  //       driver,
  //       onlySelectable: onlySelectable === 'true',
  //       allowedLoadingPoints: allowedAddresses,
  //       loadingZone,
  //       period,
  //       search,
  //     })

  //     const ordersForRegistry = await OrderModel.aggregate(pipeline)
  //     return ordersForRegistry
  //   }
}

export default new PaymentInvoiceService({
  model: PaymentInvoiceModel,
  emitter: emitTo,
  modelName: 'paymentInvoice',
  logService: ChangeLogService,
})
