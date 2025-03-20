import { bus } from '@/eventBus'
import { GetListPropsDTO } from './dto/getListProps.dto'
import {
  IncomingInvoice,
  IncomingInvoiceOrder,
  IncomingInvoiceUpdatedEvent,
  OrdersRemovedFromIncomingInvoiceEvent,
} from '@/domain/incomingInvoice'
import { IncomingInvoiceModel, IncomingInvoiceOrderModel } from './models'
import { ListResultDTO } from './dto/listResult.dto'
import { CreateIncomingInvoiceDTO } from '@/domain/incomingInvoice/dto/createIncomingInvoice.dto'
import { EventBus } from 'ts-bus'
import { getListPipeline } from './pipelines/getListPipeline'
import { PickOrdersPropsDTO } from './dto/pickOrdersPropsDTO'
import { OrderForIncomingInvoice } from './dto/orderForIncomingInvoice'
import { OrderModel } from '@/models/order'
import { pickOrdersForIncomingInvoice } from './pipelines/pickOrdersPipeline'
import { InvoiceOrdersResultDTO } from './dto/invoiceOrdersResult.dto'
import { getInvoiceOrdersPipeline } from './pipelines/getInvoiceOrdersPipeline'
import { IncomingInvoiceForOrderDTO } from './dto/IncomingInvoiceForOrder.dto'

interface IProps {
  invoiceModel: typeof IncomingInvoiceModel
  invoiceOrderModel: typeof IncomingInvoiceOrderModel
  orderModel: typeof OrderModel
  bus: EventBus
}
class IncomingInvoiceRepository {
  invoiceModel: typeof IncomingInvoiceModel
  invoiceOrderModel: typeof IncomingInvoiceOrderModel
  bus: EventBus
  orderModel: typeof OrderModel

  constructor({ invoiceModel, invoiceOrderModel, bus, orderModel }: IProps) {
    this.bus = bus
    this.invoiceModel = invoiceModel
    this.invoiceOrderModel = invoiceOrderModel
    this.orderModel = orderModel

    this.bus.subscribe(IncomingInvoiceUpdatedEvent, async (e) => {
      await this.update(e.payload)
    })

    this.bus.subscribe(OrdersRemovedFromIncomingInvoiceEvent, async (e) => {
      await this.deleteOrderFromInvoice(e.payload)
    })
  }

  async update(invoice: IncomingInvoice) {
    await this.invoiceModel.updateOne({ _id: invoice._id }, invoice)
  }

  async getById(id: string): Promise<IncomingInvoice | null> {
    const invoice = await this.invoiceModel.findById(id).lean()
    if (!invoice) return null
    const orders = await this.invoiceOrderModel
      .find({ incomingInvoice: invoice._id, company: invoice.company })
      .lean()

    invoice.orders = orders.map((i) => new IncomingInvoiceOrder(i))
    return new IncomingInvoice({ ...invoice })
  }

  async getList(props: GetListPropsDTO): Promise<ListResultDTO> {
    const pipeline = getListPipeline(props)
    const result = await this.invoiceModel.aggregate(pipeline)
    return new ListResultDTO(result[0])
  }

  async getInvoiceOrders(
    invoiceId: string,
    limit = 100,
    skip = 0
  ): Promise<InvoiceOrdersResultDTO> {
    const pipeline = getInvoiceOrdersPipeline(invoiceId, limit, skip)
    const result = await this.invoiceOrderModel.aggregate(pipeline)
    return new InvoiceOrdersResultDTO(result[0] || null)
  }

  async getByOrders(orders: string[]): Promise<IncomingInvoiceOrder[]> {
    const orderDocs = await this.invoiceOrderModel
      .find({ order: orders })
      .lean()
    return orderDocs.map((i) => new IncomingInvoiceOrder(i))
  }

  async pickOrders(props: unknown): Promise<OrderForIncomingInvoice[]> {
    try {
      const pipeline = pickOrdersForIncomingInvoice(
        new PickOrdersPropsDTO(props)
      )
      const res = await this.orderModel.aggregate(pipeline)
      return res
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async create(
    data: Omit<CreateIncomingInvoiceDTO, '_id'>
  ): Promise<IncomingInvoice> {
    const invoice = await this.invoiceModel.create(data)
    return new IncomingInvoice(invoice)
  }

  async deleteById(invoiceId: string): Promise<void> {
    await this.invoiceModel.deleteOne({ _id: invoiceId })
  }

  async addOrderToInvoice(items: IncomingInvoiceOrder[]) {
    for (let i = 0; i < items.length; i++) {
      await this.invoiceOrderModel.create(items[i])
    }
  }

  async deleteOrderFromInvoice({
    invoiceId,
    orderIds,
  }: {
    invoiceId: string
    orderIds: string[]
  }): Promise<void> {
    const res = await this.invoiceOrderModel.deleteMany({
      incomingInvoice: invoiceId,
      order: orderIds,
    })
    console.log(res)
  }

  async orderIncludedInInvoice(orderId: string): Promise<boolean> {
    const orderRowInInvoice = await this.invoiceOrderModel
      .findOne({ order: orderId })
      .lean()
    return !!orderRowInInvoice
  }

  async getForOrderById(
    orderId: string
  ): Promise<IncomingInvoiceForOrderDTO | null> {
    const orderRowInInvoice = await this.invoiceOrderModel
      .findOne({ order: orderId })
      .lean()

    if (!orderRowInInvoice) return null
    const invoice = await this.invoiceModel.findOne({
      _id: orderRowInInvoice.incomingInvoice,
    })
    return invoice ? new IncomingInvoiceForOrderDTO(invoice) : null
  }

  async updateOrderInInvoice() {}
}

export default new IncomingInvoiceRepository({
  invoiceModel: IncomingInvoiceModel,
  invoiceOrderModel: IncomingInvoiceOrderModel,
  orderModel: OrderModel,
  bus,
})
