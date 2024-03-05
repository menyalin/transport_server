import { Types } from 'mongoose'
import { PAIMENT_INVOICE_STATUSES_ENUM_VALUES } from '../../constants/paymentInvoice'
import { OrderPickedForInvoiceDTO } from './dto/orderPickedForInvoice.dto'
import { DateRange } from '../../classes/dateRange'

export class PaymentInvoiceDomain {
  _id?: string
  company: string
  number: string
  numberByClient?: string
  dateByClient: Date | null
  sendDate: Date
  clientId: string
  client: any
  agreementId: string
  status: string
  isActive: boolean
  note?: string
  orders?: OrderPickedForInvoiceDTO[]
  agreement?: any

  private constructor(invoice: any) {
    this._id = invoice?._id.toString()
    this.company = invoice.company.toString()
    this.number = invoice.number
    this.numberByClient = invoice.numberByClient
    this.dateByClient = invoice.dateByClient
      ? new Date(invoice.dateByClient)
      : null
    this.sendDate = new Date(invoice.sendDate)
    this.clientId = !!invoice.client?._id
      ? invoice.client?._id.toString()
      : invoice.client

    this.agreementId = invoice.agreement
    this.status = invoice.status
    this.isActive = invoice.isActive
    this.note = invoice.note
    if (invoice.client?._id) this.client = invoice.client
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

  get invoiceTotalSumWithVat(): number {
    if (!this.orders || this.orders.length === 0) return 0
    return this.orders.reduce((sum, order) => (sum += order.total.price), 0)
  }

  get invoiceVatSum(): number {
    if (!this.orders || this.orders.length === 0) return 0
    return this.orders.reduce(
      (sum, order) => (sum += order.total.price - order.total.priceWOVat),
      0
    )
  }

  static create(invoice: any, orders: OrderPickedForInvoiceDTO[] = []) {
    const newInvoice = new PaymentInvoiceDomain(invoice)
    newInvoice.setOrders(orders)
    return newInvoice
  }

  static getDbSchema() {
    return {
      company: { type: Types.ObjectId, ref: 'Company', required: true },
      number: { type: String },
      numberByClient: { type: String },
      sendDate: Date,
      dateByClient: Date,
      client: { type: Types.ObjectId, ref: 'Partner', required: true },
      agreement: { type: Types.ObjectId, ref: 'Agreement', required: true },
      status: { type: String, enum: PAIMENT_INVOICE_STATUSES_ENUM_VALUES },
      isActive: { type: Boolean, default: true },
      note: String,
    }
  }
}
