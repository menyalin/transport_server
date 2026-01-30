import { OrderPickedForInvoiceDTO } from '../../domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import {
  GetOrdersPickedForInvoiceProps,
  IPaymentInvoiceAnalytics,
  IPickOrdersForPaymentInvoiceProps,
  IStaticticData,
} from '@/domain/paymentInvoice/interfaces'
import { PaymentInvoiceDomain } from '@/domain/paymentInvoice/paymentInvoice'
import {
  PaymentInvoice as PaymentInvoiceModel,
  OrderInPaymentInvoice as OrderInPaymentInvoiceModel,
} from '@/models'
import { pickOrdersForPaymentInvoice } from './pickOrdersForPaymentInvoice'
import { OrderInPaymentInvoice } from '@/domain/paymentInvoice/orderInPaymentInvoice'
import { getOrdersPickedForInvoice } from './getOrdersPickedForInvoice'
import { getOrdersPickedForInvoiceDTOByOrders } from './getOrdersPickedForInvoiceDTOByOrders'
import { EventBus } from 'ts-bus'
import { bus } from '@/eventBus'
import {
  PaymentInvoicePaidEvent,
  PaymentInvoiceSendedEvent,
} from '@/domain/paymentInvoice/events'
import { InvoiceOrdersResultDTO } from './dto/invoiceOrdersResult.dto'
import { invoiceAnalyticsPipelineBuilder } from './pipelines/invoiceAnalyticsPipelineBuilder'
import { Types } from 'mongoose'
import { getInvoicesByOrderIdsPipelineBuilder } from './pipelines/getInvoicesByOrderIdsPipelineBuilder'

interface IProps {
  invoiceModel: typeof PaymentInvoiceModel
  invoiceOrderModel: typeof OrderInPaymentInvoiceModel
  bus: EventBus
}

class PaymentInvoiceRepository {
  invoiceModel: typeof PaymentInvoiceModel
  invoiceOrderModel: typeof OrderInPaymentInvoiceModel
  bus: EventBus

  constructor(p: IProps) {
    this.bus = p.bus
    this.invoiceModel = p.invoiceModel
    this.invoiceOrderModel = p.invoiceOrderModel

    this.bus.subscribe(
      PaymentInvoiceSendedEvent,
      async ({ payload: updatedInvoice }) => {
        if (!updatedInvoice?._id) return
        await this.updateInvoice(updatedInvoice._id.toString(), updatedInvoice)
      }
    )

    this.bus.subscribe(
      PaymentInvoicePaidEvent,
      async ({ payload: updatedInvoice }) => {
        if (!updatedInvoice?._id) return
        await this.updateInvoice(updatedInvoice._id.toString(), updatedInvoice)
      }
    )
  }

  async getInvoiceById(id: string): Promise<PaymentInvoiceDomain | null> {
    const res = await PaymentInvoiceModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
        },
      },
    ])
    if (!res || !res[0]) return null
    return PaymentInvoiceDomain.create(res[0])
  }

  async getInvoiceOrders(
    invoiceId: string,
    limit?: number,
    skip?: number
  ): Promise<InvoiceOrdersResultDTO> {
    const invoice = await PaymentInvoiceModel.findById(invoiceId).lean()
    if (!invoice) throw new Error('Invoice not found')
    return await getOrdersPickedForInvoice({
      invoiceId,
      limit,
      skip,
      company: invoice.company.toString(),
      usePriceWithVat: invoice.usePriceWithVat,
      vatRate: invoice.vatRate,
    })
  }

  async updateInvoice(id: string, body: any): Promise<PaymentInvoiceDomain> {
    const paymentInvoice = await PaymentInvoiceModel.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).lean()

    if (!paymentInvoice)
      throw new Error(
        'PaymentInvoiceRepository : updateInvoice : payment invoice not found'
      )
    return PaymentInvoiceDomain.create(paymentInvoice)
  }

  async updateOrdersInPaymentInvoce(
    items: OrderInPaymentInvoice[]
  ): Promise<void> {
    const makeOperation = (filter: object, update: object) => ({
      updateOne: { filter, update, upsert: false },
    })

    await OrderInPaymentInvoiceModel.bulkWrite(
      items.map((i) => makeOperation({ order: i.order }, i))
    )
  }

  async addOrdersToInvoice(items: OrderInPaymentInvoice[]): Promise<void> {
    await OrderInPaymentInvoiceModel.create(items)
  }

  async removeOrdersFromInvoice(
    items: OrderPickedForInvoiceDTO[]
  ): Promise<void> {
    await OrderInPaymentInvoiceModel.deleteMany({
      order: { $in: items.map((i) => i._id) },
    })
  }

  async pickOrdersForPaymentInvoice(
    params: IPickOrdersForPaymentInvoiceProps,
    vatRate: number,
    usePriceWithVat: boolean
  ): Promise<[unknown[], IStaticticData?]> {
    return await pickOrdersForPaymentInvoice(params, vatRate, usePriceWithVat)
  }

  async getOrdersPickedForInvoiceDTOByOrders(
    p: GetOrdersPickedForInvoiceProps
  ): Promise<OrderPickedForInvoiceDTO[]> {
    return await getOrdersPickedForInvoiceDTOByOrders(p)
  }

  async getOrdersPickedForInvoice(
    params: GetOrdersPickedForInvoiceProps
  ): Promise<InvoiceOrdersResultDTO> {
    return await getOrdersPickedForInvoice(params)
  }

  async getOrderInPaymentInvoiceItemsByOrders(
    orders: string[]
  ): Promise<OrderInPaymentInvoice[]> {
    if (!orders || !Array.isArray(orders))
      throw new Error(
        'PaymentInvoiceRepository : getOrderInPaymentInvoiceItemsByOrders : args error - orders is missing!'
      )

    const items: OrderInPaymentInvoice[] = await this.invoiceOrderModel
      .find<OrderInPaymentInvoice>({
        order: orders,
      })
      .lean()
    return items.map((i) => new OrderInPaymentInvoice(i))
  }

  async getInvoiceAnalytics(
    invoiceId: string
  ): Promise<IPaymentInvoiceAnalytics> {
    const pipeline = invoiceAnalyticsPipelineBuilder(invoiceId)
    const res = await OrderInPaymentInvoiceModel.aggregate(pipeline)
    return res[0]
  }

  async getInvoicesByOrderIds(
    orderIds: string[]
  ): Promise<PaymentInvoiceDomain[]> {
    const pipeline = getInvoicesByOrderIdsPipelineBuilder(orderIds)
    const res = await this.invoiceOrderModel.aggregate(pipeline)
    return res.map((i) => PaymentInvoiceDomain.create(i))
  }
}

export default new PaymentInvoiceRepository({
  bus,
  invoiceModel: PaymentInvoiceModel,
  invoiceOrderModel: OrderInPaymentInvoiceModel,
})
