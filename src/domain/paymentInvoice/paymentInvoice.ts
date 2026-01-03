import { Types } from 'mongoose'
import {
  PAIMENT_INVOICE_STATUSES_ENUM,
  PAIMENT_INVOICE_STATUSES_ENUM_VALUES,
} from '@/constants/paymentInvoice'
import { OrderPickedForInvoiceDTO } from './dto/orderPickedForInvoice.dto'
import { DateRange } from '@/classes/dateRange'
import { BusEvent } from 'ts-bus/types'
import { PaymentInvoicePaidEvent, PaymentInvoiceSendedEvent } from './events'

export class PaymentInvoiceDomain {
  _id?: string
  company: string
  number: string
  numberByClient?: string
  dateByClient: Date | null
  date: Date
  payDate: Date | null
  plannedPayDate: Date | null
  sendDate: Date | null
  clientId: string
  client: any
  agreementId: string
  status: string
  isActive: boolean
  note?: string
  orders?: OrderPickedForInvoiceDTO[]
  agreement?: any
  vatRate: number
  usePriceWithVat: boolean
  ordersCount: number | null
  priceWOVat: number | null
  priceWithVat: number | null

  private constructor(invoice: any) {
    this._id = invoice?._id.toString()
    this.company = invoice.company.toString()
    this.number = invoice.number
    this.numberByClient = invoice.numberByClient
    this.dateByClient = invoice.dateByClient
      ? new Date(invoice.dateByClient)
      : null

    this.date = new Date(invoice.date)
    this.sendDate = invoice.sendDate ? new Date(invoice.sendDate) : null
    this.payDate = invoice.payDate ? new Date(invoice.payDate) : null

    this.plannedPayDate = invoice.plannedPayDate
      ? new Date(invoice.plannedPayDate)
      : null

    this.clientId = invoice.client?._id
      ? invoice.client?._id.toString()
      : invoice.client

    this.agreementId = invoice.agreement
    this.status = invoice.status
    this.isActive = invoice.isActive
    this.note = invoice.note
    if (invoice.client?._id) this.client = invoice.client
    this.ordersCount = invoice.ordersCount || null
    this.priceWithVat = invoice.priceWithVat || null
    this.priceWOVat = invoice.priceWOVat || null
    this.vatRate = invoice.vatRate ?? null
    this.usePriceWithVat = invoice.usePriceWithVat
  }

  setAgreement(agreement: any) {
    this.agreement = agreement
  }

  setOrders(orders: OrderPickedForInvoiceDTO[]): void {
    this.orders = orders
  }

  get invoicePeriod(): DateRange | null {
    if (!this.orders || this.orders.length === 0) return null
    const dates = this.orders
      .map((order) => order.plannedDate)
      .sort((a, b) => +a - +b)
    return new DateRange(dates[0], dates[dates.length - 1])
  }

  get vatRateInfoIsMissing(): boolean {
    return this.vatRate == null || this.usePriceWithVat == null
  }

  get invoiceTotalSumWithVat(): number {
    if (!this.orders || this.orders.length === 0) return 0
    return this.orders.reduce((sum, order) => (sum += order.total.price), 0)
  }

  get invoiceVatSum(): number {
    if (!this.orders || this.orders.length === 0) return 0

    return this.orders.reduce((sum, order) => {
      return sum + (order.total.price - order.total.priceWOVat)
    }, 0)
  }

  setStatusSended(sendDate: Date): BusEvent[] {
    if (!this._id || !sendDate) return []
    this.sendDate = sendDate
    this.payDate = null
    this.status = PAIMENT_INVOICE_STATUSES_ENUM.sended
    return [PaymentInvoiceSendedEvent(this)]
  }

  setStatusPaid(payDate: Date): BusEvent[] {
    if (!this._id || !payDate) return []
    this.payDate = payDate
    this.status = PAIMENT_INVOICE_STATUSES_ENUM.paid
    return [PaymentInvoicePaidEvent(this)]
  }

  static create(invoice: any, orders: OrderPickedForInvoiceDTO[] = []) {
    const newInvoice = new PaymentInvoiceDomain(invoice)
    newInvoice.setOrders(orders)
    return newInvoice
  }

  static get dbSchema() {
    return {
      company: { type: Types.ObjectId, ref: 'Company', required: true },
      number: { type: String },
      numberByClient: { type: String },
      date: Date,
      sendDate: Date,
      plannedPayDate: Date,
      payDate: Date,
      dateByClient: Date,
      client: { type: Types.ObjectId, ref: 'Partner', required: true },
      agreement: { type: Types.ObjectId, ref: 'Agreement', required: true },
      status: { type: String, enum: PAIMENT_INVOICE_STATUSES_ENUM_VALUES },
      isActive: { type: Boolean, default: true },
      note: String,
      ordersCount: Number,
      priceWOVat: Number,
      priceWithVat: Number,
      vatRate: Number,
      usePriceWithVat: Boolean,
    }
  }
}
