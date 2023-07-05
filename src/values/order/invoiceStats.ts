// @ts-nocheck
import mongoose from 'mongoose'
import { PAIMENT_INVOICE_STATUSES_ENUM } from '../../constants/paymentInvoice.js'

export class InvoiceStats {
  static getDbSchema() {
    return {
      invoiceId: {
        type: mongoose.Types.ObjectId,
        ref: 'PaymentInvoice',
        required: true,
      },
      status: {
        type: String,
        enum: PAIMENT_INVOICE_STATUSES_ENUM,
      },
      invoiceDate: {
        type: Date,
      },
    }
  }
}
