import { emitTo } from '@/socket'
import ChangeLogService from '../changeLog'
import PaymentInvoiceRepository from '@/repositories/paymentInvoice/paymentInvoice.repository'
import {
  OrderInPaymentInvoice as OrderInPaymentInvoiceModel,
  PaymentInvoice as PaymentInvoiceModel,
} from '@/models'
import { BadRequestError } from '@/helpers/errors'
import { getListPipeline } from './pipelines/getListPipeline'
import { InvoiceOrdersResultDTO } from '@/repositories/paymentInvoice/dto/invoiceOrdersResult.dto'

import { PaymentInvoiceDomain } from '@/domain/paymentInvoice/paymentInvoice'
import {
  IAddOrdersToInvoiceProps,
  IInvoiceVatRateInfo,
  IPickOrdersForPaymentInvoiceProps,
  PickOrdersForPaymentInvoicePropsSchema,
} from '@/domain/paymentInvoice/interfaces'
import { PipelineStage } from 'mongoose'
import { OrderInPaymentInvoice } from '@/domain/paymentInvoice/orderInPaymentInvoice'
import { OrderPickedForInvoiceDTO } from '@/domain/paymentInvoice/dto/orderPickedForInvoice.dto'

import * as pf from './printForms'
import { PrintForm } from '@/domain/printForm/printForm.domain'
import {
  AgreementRepository,
  CarrierRepository,
  PrintFormRepository,
} from '@/repositories'
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

  private async getInvoiceVatRateInfoByAgreementAndDate(
    clientAgreementId: string,
    date: Date
  ): Promise<IInvoiceVatRateInfo> {
    const agreement = await AgreementRepository.getById(clientAgreementId)
    if (!agreement)
      throw new BadRequestError(
        'указанное в акте соглашение с клиентом не найдено'
      )

    if (!agreement.executor)
      throw new BadRequestError('В выбранном соглашении не указан исполнитель')

    const carrier = await CarrierRepository.getById(agreement.executor)
    if (!carrier) throw new BadRequestError('Исполнитель не найден')

    const vatRate = carrier.getVatRateByDate(date)
    if (vatRate === null)
      throw new BadRequestError(
        'У исполнителя на указанную дату ставка НДС отсутствует'
      )

    return {
      vatRate,
      usePriceWithVat: agreement.usePriceWithVAT,
    }
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

  async getById(id: string): Promise<PaymentInvoiceDomain | null> {
    const paymentInvoice = await PaymentInvoiceRepository.getInvoiceById(id)
    if (paymentInvoice?.agreementId)
      paymentInvoice.setAgreement(
        await AgreementRepository.getById(paymentInvoice.agreementId)
      )
    return paymentInvoice
  }

  async getInvoiceOrders(
    invoiceId: string,
    limit = 100,
    skip = 0
  ): Promise<InvoiceOrdersResultDTO> {
    const res = await PaymentInvoiceRepository.getInvoiceOrders(
      invoiceId,
      limit,
      skip
    )
    return res
  }

  async updateOne({ id, body, user }: { id: string; body: any; user: string }) {
    let vatRateData: IInvoiceVatRateInfo | null = null
    const existedInvoice = await PaymentInvoiceRepository.getInvoiceById(id)
    if (!existedInvoice)
      throw new BadRequestError('Редактируемый исходящий акт не найден')

    if (
      existedInvoice.vatRateInfoIsMissing ||
      +existedInvoice.date !== +new Date(body.date) ||
      existedInvoice.agreementId !== body.agreement
    ) {
      vatRateData = await this.getInvoiceVatRateInfoByAgreementAndDate(
        body.agreement,
        new Date(body.date)
      )
    }

    const invoiceAnalytics =
      await PaymentInvoiceRepository.getInvoiceAnalytics(id)

    const updatedInvoice = await PaymentInvoiceRepository.updateInvoice(id, {
      ...body,
      ...vatRateData,
      ...invoiceAnalytics,
    })

    await this.logService.add({
      docId: updatedInvoice._id,
      coll: this.modelName,
      opType: 'update',
      user,
      company: updatedInvoice.company,
      body: updatedInvoice,
    })

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
    if (!body.agreement)
      throw new BadRequestError('Не указано соглашение с клиентом')
    if (!body.date) throw new BadRequestError('Не указана дата акта')

    const vatRateData = await this.getInvoiceVatRateInfoByAgreementAndDate(
      body.agreement,
      new Date(body.date)
    )

    const data = await this.model.create({ ...body, company, ...vatRateData })

    await this.logService.add({
      docId: data._id.toString(),
      coll: this.modelName,
      opType: 'create',
      user,
      company: data.company.toString(),
      body: data.toJSON(),
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

    try {
      const invoice =
        await PaymentInvoiceRepository.getInvoiceById(paymentInvoiceId)
      if (!invoice) throw new BadRequestError('Исходящий АКТ не найден')
      if (invoice.vatRateInfoIsMissing)
        throw new BadRequestError('В акте отсутствует ставка НДС')

      const ordersDTO =
        await PaymentInvoiceRepository.getOrdersPickedForInvoiceDTOByOrders({
          orderIds: orders,
          company,
          vatRate: invoice.vatRate,
          usePriceWithVat: invoice.usePriceWithVat,
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
      const newInvoiceAnalytics =
        await PaymentInvoiceRepository.getInvoiceAnalytics(invoice._id)

      await PaymentInvoiceRepository.updateInvoice(
        invoice._id,
        newInvoiceAnalytics
      )

      this.emitter(company, 'orders:addedToPaymentInvoice', {
        orders: ordersDTO,
        paymentInvoiceId,
        total: newInvoiceAnalytics,
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

    const invoice =
      await PaymentInvoiceRepository.getInvoiceById(paymentInvoiceId)
    if (!invoice) throw new BadRequestError('Исходящий АКТ не найден')
    if (invoice.vatRate == null)
      throw new BadRequestError('В акте отсутствует ставка НДС')

    const ordersToRemove =
      await PaymentInvoiceRepository.getOrdersPickedForInvoice({
        orderIds: rowIds,
        company,
        vatRate: invoice.vatRate,
        usePriceWithVat: invoice.usePriceWithVat,
      })
    if (ordersToRemove.items.length === 0) return false
    await PaymentInvoiceRepository.removeOrdersFromInvoice(ordersToRemove.items)

    const newAnalylicsInfo =
      await PaymentInvoiceRepository.getInvoiceAnalytics(paymentInvoiceId)

    await PaymentInvoiceRepository.updateInvoice(invoice._id, newAnalylicsInfo)

    this.emitter(company, 'orders:removedFromPaimentInvoice', {
      rowIds,
      paymentInvoiceId: paymentInvoiceId,
      total: newAnalylicsInfo,
    })

    return true
  }

  async pickOrders(props: IPickOrdersForPaymentInvoiceProps) {
    const parsedProps = PickOrdersForPaymentInvoicePropsSchema.parse(props)
    if (!parsedProps.paymentInvoiceId)
      throw new BadRequestError('paymentInvoiceId is undefined.')

    const invoice = await PaymentInvoiceRepository.getInvoiceById(
      parsedProps.paymentInvoiceId
    )
    if (!invoice) throw new BadRequestError('Исходящий акт не найден')

    const result = await PaymentInvoiceRepository.pickOrdersForPaymentInvoice(
      props,
      invoice.vatRate,
      invoice.usePriceWithVat
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
      const [item] =
        await PaymentInvoiceRepository.getOrderInPaymentInvoiceItemsByOrders([
          orderId,
        ])
      if (!item || !item.paymentInvoice)
        throw new BadRequestError('Запись рейса не найдена в акте')

      const invoice = await PaymentInvoiceRepository.getInvoiceById(
        item.paymentInvoice
      )
      if (!invoice)
        throw new BadRequestError(
          'Исходящий акт отсутствует, обновление цен рейса не возможно'
        )
      if (invoice.vatRateInfoIsMissing)
        throw new BadRequestError('В акте отсутствует информация о ставке НДС')

      const { items } =
        await PaymentInvoiceRepository.getOrdersPickedForInvoice({
          orderIds: [orderId],
          company,
          vatRate: invoice.vatRate,
          usePriceWithVat: invoice.usePriceWithVat,
        })
      if (!items || !items[0]) return null
      const order = items[0]
      // Сохранить старую цену
      const oldPrice = { ...item.total }

      item.setTotal(order)
      order.saveTotal()

      await PaymentInvoiceRepository.updateOrdersInPaymentInvoce([item])

      // Обновить метаданные акта (дельта)
      invoice.updateOrderPriceChanged(oldPrice, order.total)
      await PaymentInvoiceRepository.updateInvoice(invoice._id, {
        priceWithVat: invoice.priceWithVat,
        priceWOVat: invoice.priceWOVat,
      })

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
