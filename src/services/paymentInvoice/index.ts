import { emitTo } from '../../socket'
import ChangeLogService from '../changeLog'
import PaymentInvoiceRepository from '../../repositories/paymentInvoice/paymentInvoice.repository'
import {
  OrderInPaymentInvoice as OrderInPaymentInvoiceModel,
  PaymentInvoice as PaymentInvoiceModel,
} from '../../models'
import { BadRequestError } from '../../helpers/errors'
import { getListPipeline } from './pipelines/getListPipeline'
import { DateRange } from '../../classes/dateRange'
import { PaymentInvoiceDomain } from '../../domain/paymentInvoice/paymentInvoice'
import {
  IAddOrdersToInvoiceProps,
  IPickOrdersForPaymentInvoiceProps,
} from '../../domain/paymentInvoice/interfaces'
import { PipelineStage } from 'mongoose'
import { OrderInPaymentInvoice } from '../../domain/paymentInvoice/orderInPaymentInvoice'
import { OrderPickedForInvoiceDTO } from '../../domain/paymentInvoice/dto/orderPickedForInvoice.dto'

import * as pf from './printForms'
import { PrintForm } from '../../domain/printForm/printForm.domain'
import { PrintFormRepository } from '../../repositories'

interface IConstructorProps {
  model: typeof PaymentInvoiceModel
  modelName: string
  logService: typeof ChangeLogService
  emitter: typeof emitTo
}
class PaymentInvoiceService {
  model: typeof PaymentInvoiceModel
  modelName: string
  logService: typeof ChangeLogService
  emitter: typeof emitTo

  constructor({ model, emitter, modelName, logService }: IConstructorProps) {
    this.model = model
    this.logService = logService
    this.emitter = emitter
    this.modelName = modelName
  }

  async deleteById({
    id,
    user,
    company,
  }: {
    id: string
    user: string
    company: string
  }): Promise<any> {
    const ordersInInvoice = await OrderInPaymentInvoiceModel.find({
      paymentInvoice: id,
    }).lean()

    if (ordersInInvoice.length > 0)
      throw new BadRequestError(
        'Delete is not possible. orders refer to registry'
      )

    const data = await this.model.findByIdAndDelete(id)

    this.emitter(company, `${this.modelName}:deleted`, id)

    await this.logService.add({
      docId: id,
      coll: this.modelName,
      opType: 'delete',
      user,
      company: company,
      body: '',
    })
    return data
  }

  async getById(id: string): Promise<any> {
    const paymentInvoice: PaymentInvoiceDomain | null =
      await PaymentInvoiceRepository.getInvoiceById(id)
    if (!paymentInvoice) return null
    return paymentInvoice
  }

  async updateOne({ id, body, user }: { id: string; body: any; user: string }) {
    const updatedInvoice = await PaymentInvoiceRepository.updateInvoice(
      id,
      body
    )

    await this.logService.add({
      docId: updatedInvoice._id,
      coll: this.modelName,
      opType: 'update',
      user,
      company: updatedInvoice.company,
      body: JSON.stringify(updatedInvoice),
    })

    const orders = await PaymentInvoiceRepository.getOrdersPickedForInvoice({
      paymentInvoiceId: updatedInvoice._id,
    })

    updatedInvoice.setOrders(orders)

    this.emitter(
      updatedInvoice.company,
      `${this.modelName}:updated`,
      updatedInvoice
    )
    return updatedInvoice
  }

  async create({
    body,
    user,
    company,
  }: {
    body: any
    user: string
    company: string
  }) {
    if (!company) throw new BadRequestError('bad request params')

    const data = await this.model.create({ ...body, company })
    data.orders = []

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

  async getList(params: any) {
    const pipeline = getListPipeline(params)
    const res = await this.model.aggregate(pipeline as PipelineStage[])
    return res[0] || []
  }

  async getAllowedPrintForms(
    agreement: string,
    client: string
  ): Promise<PrintForm[]> {
    return await PrintFormRepository.getTemplatesByTypeAndAgreement(
      'paymentInvoice',
      agreement,
      client
    )
  }

  async downloadDoc(invoiceId: string, templateName: string): Promise<Buffer> {
    if (!invoiceId || !templateName)
      throw new Error(
        'PaymentInvoiceService : downloadDoc : required arg is missing'
      )
    const docBuffer: Buffer = await pf.paymentInvoiceDocumentBuilder(
      invoiceId,
      templateName
    )
    return docBuffer
  }

  async addOrdersToInvoice({
    company,
    orders,
    paymentInvoiceId,
  }: IAddOrdersToInvoiceProps) {
    if (!orders || orders.length === 0)
      throw new BadRequestError(
        'PaymentInvoiceService:addOrdersToInvoice. missing required params'
      )
    // Формирую новые объекты в коллекции
    try {
      const ordersDTO: OrderPickedForInvoiceDTO[] =
        await PaymentInvoiceRepository.getOrdersForInvoiceDtoByOrders(
          orders,
          company
        )
      ordersDTO.forEach((i) => {
        i.saveTotal()
      })
      const newItemRows = ordersDTO.map((orderDTO) =>
        OrderInPaymentInvoice.create({
          order: orderDTO,
          invoiceId: paymentInvoiceId,
        })
      )

      await PaymentInvoiceRepository.addOrdersToInvoice(newItemRows)

      this.emitter(company, 'orders:addedToPaymentInvoice', {
        orders: ordersDTO,
        paymentInvoiceId,
      })

      return newItemRows
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async removeOrdersFromPaymentInvoice({
    company,
    rowIds,
    paymentInvoiceId,
  }: {
    company: string
    rowIds: string[]
    paymentInvoiceId: string
  }) {
    if (!rowIds || rowIds.length === 0)
      throw new BadRequestError(
        'PaymentInvoiceService:removeOrdersFromInvoice. missing required params'
      )
    const removedOrders = await OrderInPaymentInvoiceModel.deleteMany({
      company,
      _id: { $in: rowIds },
      paymentInvoice: paymentInvoiceId,
    })

    this.emitter(company, 'orders:removedFromPaimentInvoice', {
      rowIds,
      paymentInvoiceId: paymentInvoiceId,
    })
    return removedOrders
  }

  async pickOrders(props: IPickOrdersForPaymentInvoiceProps) {
    try {
      if (!props.company || !props.paymentInvoiceId)
        throw new BadRequestError(
          'PaymentInvoiceService:pickOrders. missing required params'
        )

      const paymentInvoice = await this.model
        .findById(props.paymentInvoiceId)
        .populate('client')

      if (!paymentInvoice)
        throw new BadRequestError(
          'PaymentInvoiceService:pickOrders. paymentInvoice not found'
        )

      const orders =
        await PaymentInvoiceRepository.pickOrdersForPaymentInvoice(props)

      return orders || []
    } catch (e) {
      console.log('pickOrders error')
      throw e
    }
  }

  async updateOrderPrices({
    orderId,
    company,
  }: {
    orderId: string
    company: string
  }): Promise<OrderPickedForInvoiceDTO | null> {
    const [order] =
      await PaymentInvoiceRepository.getOrdersForInvoiceDtoByOrders(
        [orderId],
        company
      )
    if (!order) return null

    const [item] =
      await PaymentInvoiceRepository.getOrderInPaymentInvoiceItemsByOrders([
        orderId,
      ])
    item.setTotal(order)
    order.saveTotal()

    PaymentInvoiceRepository

    return order
  }
}

export default new PaymentInvoiceService({
  model: PaymentInvoiceModel,
  emitter: emitTo,
  modelName: 'paymentInvoice',
  logService: ChangeLogService,
})
