import { Types } from 'mongoose'
import { IncomingInvoiceOrder } from './IncomingInvoiceOrder'
import { DateUtils } from '@/utils/dateUtils'
import { CreateIncomingInvoiceDTO } from './dto/createIncomingInvoice.dto'
import { BusEvent } from 'ts-bus/types'
import { IncomingInvoiceUpdatedEvent } from './events'

interface IIncomingInvoiceProps {
  _id: string
  company: string
  number: string
  date: Date | string | null
  plannedPayDate: string | Date | null
  agreement: string
  status: string
  isActive: boolean
  note?: string
  orders?: IncomingInvoiceOrder[]
}

export class IncomingInvoice {
  _id: string
  company: string
  number: string
  date: Date
  plannedPayDate: Date | null
  agreement: string
  status: string
  isActive: boolean
  note?: string
  orders: IncomingInvoiceOrder[] = []

  constructor(invoice: IIncomingInvoiceProps) {
    this._id = invoice?._id.toString()
    this.company = invoice.company.toString()
    this.number = invoice.number
    this.date = DateUtils.parseDate(invoice.date) ?? new Date()
    this.plannedPayDate = DateUtils.parseDate(invoice.plannedPayDate)
    this.agreement = invoice.agreement.toString()
    this.status = invoice.status
    this.isActive = invoice.isActive
    this.note = invoice.note
    if (invoice.orders) this.orders = invoice.orders
  }

  get allowedToAddOrders(): boolean {
    return true
  }

  hasOrders(orderIds?: string[]): boolean {
    if (!orderIds?.length) return this.orders.length > 0
    else return this.orders.filter((o) => orderIds.includes(o.order)).length > 0
  }
  setOrders(orders: IncomingInvoiceOrder[]) {
    this.orders = orders
  }

  pushOrders(orders: IncomingInvoiceOrder[]) {
    this.orders.push(...orders)
  }

  static create(p: CreateIncomingInvoiceDTO): IncomingInvoice {
    return new IncomingInvoice(p)
  }

  update(body: Omit<CreateIncomingInvoiceDTO, '_id' | 'company'>): BusEvent[] {
    if (this.orders.length === 0) {
      this.agreement = body.agreement
    }
    this.date = body.date
    this.number = body.number
    this.plannedPayDate = body.plannedPayDate
    this.status = body.status
    this.isActive = body.isActive
    this.note = body.note
    return [IncomingInvoiceUpdatedEvent(this)]
  }

  static get dbSchema() {
    return {
      company: { type: Types.ObjectId, ref: 'Company', required: true },
      number: String,
      date: { type: Date, required: true },
      plannedPayDate: Date,
      agreement: { type: Types.ObjectId, ref: 'Agreement', required: true },
      status: String,
      isActive: Boolean,
      note: String,
    }
  }
}
