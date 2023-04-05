// import mongoose from 'mongoose'
import ChangeLogService from '../changeLog/index.js'
import {
  OrderInPaymentInvoice as OrderInPaymentInvoiceModel,
  PaymentInvoice as PaymentInvoiceModel,
} from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import { BadRequestError } from '../../helpers/errors.js'
import { getListPipeline } from './pipelines/getListPipeline.js'
import { pickOrdersForPaymentInvoice } from './pickOrdersForPaymentInvoice.js'
import getOrdersForInvoice from './getOrdersForInvoice.js'

class PaymentInvoiceService {
  constructor({ model, emitter, modelName, logService }) {
    this.model = model
    this.logService = logService
    this.emitter = emitter
    this.modelName = modelName
  }

  async deleteById({ id, user, company }) {
    const ordersInInvoice = await OrderInPaymentInvoiceModel.find({
      paymentInvoice: id,
    }).lean()

    if (ordersInInvoice.length > 0)
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
    const paymentInvoice = await this.model.findById(id).lean()
    const orders = await getOrdersForInvoice({
      paymentInvoiceId: paymentInvoice._id.toString(),
    })
    paymentInvoice.orders = orders
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

    const orders = await getOrdersForInvoice({
      paymentInvoiceId: paymentInvoice._id.toString(),
    })
    paymentInvoice.orders = orders

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
    data.orders = []
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

  async addOrdersToInvoice({ company, orders, paymentInvoiceId }) {
    if (!orders || orders.length === 0)
      throw new BadRequestError(
        'PaymentInvoiceService:addOrdersToInvoice. missing required params'
      )
    // Формирую новые объекты в коллекции
    const newObjectItems = orders.map((order) => ({
      order,
      paymentInvoice: paymentInvoiceId,
      company,
    }))
    const newOrdersInInvoice = await OrderInPaymentInvoiceModel.create(
      newObjectItems
    )

    const addedOrders = await getOrdersForInvoice({
      orderIds: orders,
    })

    newOrdersInInvoice.forEach(async (invoiceRow) => {
      const order = addedOrders.find(
        (ord) => ord._id.toString() === invoiceRow.order.toString()
      )
      if (!order) return null
      invoiceRow.total = order.total
      invoiceRow.totalByTypes = order.totalByTypes
      invoiceRow.itemType = order.itemType
      order.savedTotal = order.total
      order.savedTotalByTypes = order.totalByTypes
      order.needUpdate = false
      await invoiceRow.save()
    })

    this.emitter(company, 'orders:addedToPaymentInvoice', {
      orders: addedOrders,
      paymentInvoiceId,
    })

    return newOrdersInInvoice
  }

  async removeOrdersFromPaymentInvoice({ company, orders, paymentInvoiceId }) {
    if (!orders || orders.length === 0)
      throw new BadRequestError(
        'PaymentInvoiceService:removeOrdersFromInvoice. missing required params'
      )
    const removedOrders = await OrderInPaymentInvoiceModel.deleteMany({
      company,
      order: { $in: orders },
      paymentInvoice: paymentInvoiceId,
    })

    this.emitter(company, 'orders:removedFromPaimentInvoice', {
      orders,
      paymentInvoiceId: paymentInvoiceId,
    })
    return removedOrders
  }

  async pickOrders({
    paymentInvoiceId,
    company,
    client,
    docStatus,
    onlySelectable,
    truck,
    driver,
    loadingZone,
    period,
    search,
  }) {
    if (!company || !paymentInvoiceId)
      throw new BadRequestError(
        'PaymentInvoiceService:pickOrders. missing required params'
      )
    const paymentInvoice = await this.model
      .findById(paymentInvoiceId)
      .populate('client')

    if (!paymentInvoice)
      throw new BadRequestError(
        'PaymentInvoiceService:pickOrders. paymentInvoice not found'
      )
    const orders = await pickOrdersForPaymentInvoice({
      paymentInvoiceId,
      company,
      client,
      docStatus,
      onlySelectable,
      truck,
      driver,
      loadingZone,
      period,
      search,
    })

    return orders || []
  }

  async updateOrderPrices({ orderId }) {
    const [order] = await getOrdersForInvoice({
      orderIds: [orderId],
    })
    if (!order) return null
    const paymentInvoiceRow = await OrderInPaymentInvoiceModel.findOne({
      order: orderId,
    })
    paymentInvoiceRow.total = order.total
    paymentInvoiceRow.totalByTypes = order.totalByTypes
    order.savedTotal = order.total
    order.savedTotalByTypes = order.totalByTypes
    order.needUpdate = false
    await paymentInvoiceRow.save()

    return order
  }
}

export default new PaymentInvoiceService({
  model: PaymentInvoiceModel,
  emitter: emitTo,
  modelName: 'paymentInvoice',
  logService: ChangeLogService,
})
