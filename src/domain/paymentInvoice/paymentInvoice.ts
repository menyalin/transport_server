// @ts-nocheck
import pkg from 'mongoose'
import { PAIMENT_INVOICE_STATUSES_ENUM_VALUES } from '../../constants/paymentInvoice'
const { Types } = pkg

export class PaymentInvoiceDomain {
  constructor(invoice, agreement, orders) {
    this.company = invoice.company
    this.number = invoice.number
    this.sendDate = new Date(invoice.sendDate)
    this.clientId = invoice.client
    this.agreementId = invoice.agreement
    this.status = invoice.status
    this.isActive = invoice.isActive
    this.note = invoice.note
  }

  async create() {
    return new PaymentInvoiceDomain(invoice, agreement, orders)
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
