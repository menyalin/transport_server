import { Types } from 'mongoose'
import { IncomingInvoiceOrder } from './IncomingInvoiceOrder'
import { DateUtils } from '@/utils/dateUtils'
import { CreateIncomingInvoiceDTO } from './dto/createIncomingInvoice.dto'
import { BusEvent } from 'ts-bus/types'
import {
  IncomingInvoiceUpdatedEvent,
  OrdersRemovedFromIncomingInvoiceEvent,
} from './events'
import { INCOMING_INVOICE_STATUSES_ENUM } from '@/constants/incomingInvoice'

interface IIncomingInvoiceProps {
  _id: string
  company: string
  number: string
  date: Date | string | null
  plannedPayDate: string | Date | null
  agreement: string
  carrier: string
  status: string
  isActive: boolean
  note?: string
  orders?: IncomingInvoiceOrder[]
  ordersCount?: number
  priceWithVat?: number
  priceWOVat?: number
}

export class IncomingInvoice {
  _id: string
  company: string
  number: string
  date: Date
  plannedPayDate: Date | null
  agreement: string
  carrier: string
  status: string
  isActive: boolean
  note?: string
  orders: IncomingInvoiceOrder[] = []
  ordersCount?: number
  priceWithVat?: number
  priceWOVat?: number

  constructor(invoice: IIncomingInvoiceProps) {
    this._id = invoice?._id.toString()
    this.company = invoice.company.toString()
    this.number = invoice.number
    this.date = DateUtils.parseDate(invoice.date) ?? new Date()
    this.plannedPayDate = DateUtils.parseDate(invoice.plannedPayDate)
    this.agreement = invoice.agreement.toString()
    this.carrier = invoice.carrier
    this.status = invoice.status
    this.isActive = invoice.isActive
    this.note = invoice.note
    this.ordersCount = invoice.ordersCount
    this.priceWithVat = invoice.priceWithVat
    this.priceWOVat = invoice.priceWOVat
    if (invoice.orders) this.orders = invoice.orders
  }

  get allowedToChangeOrders(): boolean {
    return this.status === INCOMING_INVOICE_STATUSES_ENUM.preparing
  }

  hasOrders(orderIds?: string[]): boolean {
    if (!orderIds?.length) return this.orders.length > 0
    else return this.orders.filter((o) => orderIds.includes(o.order)).length > 0
  }
  setOrders(orders: IncomingInvoiceOrder[]) {
    this.orders = orders
  }

  pushOrders(orders: IncomingInvoiceOrder[]): BusEvent[] {
    this.orders.push(...orders)
    this.refreshAnalytics()
    return [IncomingInvoiceUpdatedEvent(this)]
  }

  removeOrders(orderIds: string[]): BusEvent[] {
    this.orders = this.orders.filter((o) => !orderIds.includes(o.order))
    this.refreshAnalytics()
    return [
      IncomingInvoiceUpdatedEvent(this),
      OrdersRemovedFromIncomingInvoiceEvent({
        orderIds,
        invoiceId: this._id.toString(),
      }),
    ]
  }
  private refreshAnalytics() {
    this.ordersCount = this.orders.length
    this.priceWithVat = this.orders.reduce(
      (sum, order) => (sum += order.total.price),
      0
    )
    this.priceWOVat = this.orders.reduce(
      (sum, order) => (sum += order.total.priceWOVat),
      0
    )
  }
  update(body: Omit<CreateIncomingInvoiceDTO, '_id' | 'company'>): BusEvent[] {
    const isEmptyInvoice = this.ordersCount === 0

    if (isEmptyInvoice) this.agreement = body.agreement
    if (!this.carrier || isEmptyInvoice) this.carrier = body.carrier

    this.date = body.date
    this.number = body.number
    this.plannedPayDate = body.plannedPayDate
    this.status = body.status
    this.isActive = body.isActive
    this.note = body.note
    this.refreshAnalytics()
    return [IncomingInvoiceUpdatedEvent(this)]
  }

  static create(p: CreateIncomingInvoiceDTO): IncomingInvoice {
    return new IncomingInvoice(p)
  }

  static get dbSchema() {
    return {
      company: { type: Types.ObjectId, ref: 'Company', required: true },
      number: String,
      date: { type: Date, required: true },
      plannedPayDate: Date,
      agreement: { type: Types.ObjectId, ref: 'Agreement', required: true },
      carrier: { type: Types.ObjectId, ref: 'Carrier', required: true },
      status: String,
      isActive: Boolean,
      note: String,
      ordersCount: Number,
      priceWithVat: Number,
      priceWOVat: Number,
    }
  }
}
