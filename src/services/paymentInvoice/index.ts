import { emitTo } from '../../socket'
import ChangeLogService from '../changeLog'
import PaymentInvoiceRepository from '../../repositories/paymentInvoice/paymentInvoice.repository'
import {
  OrderInPaymentInvoice as OrderInPaymentInvoiceModel,
  PaymentInvoice as PaymentInvoiceModel,
} from '../../models'
import { BadRequestError } from '../../helpers/errors'
import { getListPipeline } from './pipelines/getListPipeline'

import { PaymentInvoiceDomain } from '../../domain/paymentInvoice/paymentInvoice'
import {
  IAddOrdersToInvoiceProps,
  IPickOrdersForPaymentInvoiceProps,
  PickOrdersForPaymentInvoicePropsSchema,
} from '../../domain/paymentInvoice/interfaces'
import { PipelineStage } from 'mongoose'
import { OrderInPaymentInvoice } from '../../domain/paymentInvoice/orderInPaymentInvoice'
import { OrderPickedForInvoiceDTO } from '../../domain/paymentInvoice/dto/orderPickedForInvoice.dto'

import * as pf from './printForms'
import { PrintForm } from '../../domain/printForm/printForm.domain'
import {
  AgreementRepository,
  CarrierRepository,
  PrintFormRepository,
} from '../../repositories'
import { BusEvent } from 'ts-bus/types'
import { EventBus } from 'ts-bus'
import { bus } from '@/eventBus'

interface ISetInvoiceStatusProps {
  invoiceId: string
  dateFieldName: string
  value: Date
}

interface IConstructorProps {
  model: typeof PaymentInvoiceModel
  modelName: string
  logService: typeof ChangeLogService
  emitter: typeof emitTo
  bus: EventBus
}
class PaymentInvoiceService {
  model: typeof PaymentInvoiceModel
  modelName: string
  logService: typeof ChangeLogService
  emitter: typeof emitTo
  bus: EventBus

  constructor({
    model,
    emitter,
    modelName,
    logService,
    bus,
  }: IConstructorProps) {
    this.model = model
    this.logService = logService
    this.emitter = emitter
    this.modelName = modelName
    this.bus = bus
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
      invoiceId: updatedInvoice._id,
      company: updatedInvoice.company,
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
    registryData,
  }: IAddOrdersToInvoiceProps) {
    if (!orders || orders.length === 0)
      throw new BadRequestError(
        'PaymentInvoiceService:addOrdersToInvoice. missing required params'
      )
    // Формирую новые объекты в коллекции
    try {
      const ordersDTO: OrderPickedForInvoiceDTO[] =
        await PaymentInvoiceRepository.getOrdersPickedForInvoiceDTOByOrders({
          orderIds: orders,
          company,
        })

      ordersDTO.forEach((i) => {
        if (registryData) i.addLoaderData(registryData)
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
    const parsedProps = PickOrdersForPaymentInvoicePropsSchema.parse(props)

    const clientAgreement = await AgreementRepository.getById(
      parsedProps.agreement
    )
    if (!clientAgreement)
      throw new BadRequestError('Соглашение с клиентом не найдено')
    if (!clientAgreement.executor)
      throw new BadRequestError('В соглашении с клиентом не задан исполнитель')

    const executor = await CarrierRepository.getById(clientAgreement.executor)
    if (!executor)
      throw new BadRequestError(
        'Исполнитель по соглашению с клиентом не найден'
      )
    const usePriceWithVat = clientAgreement.usePriceWithVAT
    const vatRate = executor.getVatRateByDate(parsedProps.invoiceDate)

    if (!vatRate)
      throw new BadRequestError('Для исполнителя не определена ставка НДС')
    const result = await PaymentInvoiceRepository.pickOrdersForPaymentInvoice(
      props,
      vatRate,
      usePriceWithVat
    )

    return result || [[]]
  }

  async setStatus(
    props: ISetInvoiceStatusProps
  ): Promise<PaymentInvoiceDomain> {
    let events: BusEvent[] = []
    const invoice = await PaymentInvoiceRepository.getInvoiceById(
      props.invoiceId
    )
    if (!invoice) throw new BadRequestError('Invoice not found')
    if (props.dateFieldName === 'sendDate')
      events = invoice.setStatusSended(props.value)
    else if (props.dateFieldName === 'payDate')
      events = invoice.setStatusPaid(props.value)
    events.forEach((event) => this.bus.publish(event))
    return invoice
  }

  async updateOrderPrices({
    orderId,
    company,
  }: {
    orderId: string
    company: string
  }): Promise<OrderPickedForInvoiceDTO | null> {
    try {
      const [order] = await PaymentInvoiceRepository.getOrdersPickedForInvoice({
        orderIds: [orderId],
        company,
      })
      if (!order) return null

      const [item] =
        await PaymentInvoiceRepository.getOrderInPaymentInvoiceItemsByOrders([
          orderId,
        ])

      item.setTotal(order)
      order.saveTotal()

      await PaymentInvoiceRepository.updateOrdersInPaymentInvoce([item])

      return order
    } catch {
      return null
    }
  }
}

export default new PaymentInvoiceService({
  model: PaymentInvoiceModel,
  emitter: emitTo,
  modelName: 'paymentInvoice',
  logService: ChangeLogService,
  bus: bus,
})
