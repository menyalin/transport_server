import { Types } from 'mongoose'
import { PAIMENT_INVOICE_STATUSES_ENUM_VALUES } from '../../constants/paymentInvoice'
import { OrderPickedForInvoiceDTO } from './dto/orderPickedForInvoice.dto'

export class PaymentInvoiceDomain {
  _id?: string
  company: string
  number: string
  sendDate: Date
  clientId: string
  client: any
  agreementId: string
  status: string
  isActive: boolean
  note?: string
  orders?: OrderPickedForInvoiceDTO[]

  private constructor(invoice: any) {
    this._id = invoice?._id.toString()
    this.company = invoice.company
    this.number = invoice.number
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

  setOrders(orders: OrderPickedForInvoiceDTO[]): void {
    this.orders = orders
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
      sendDate: Date,
      client: { type: Types.ObjectId, ref: 'Partner', required: true },
      agreement: { type: Types.ObjectId, ref: 'Agreement', required: true },
      status: { type: String, enum: PAIMENT_INVOICE_STATUSES_ENUM_VALUES },
      isActive: { type: Boolean, default: true },
      note: String,
    }
  }
}
