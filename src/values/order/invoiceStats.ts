import mongoose from 'mongoose'
import {
  PAIMENT_INVOICE_STATUSES_ENUM,
  PAIMENT_INVOICE_STATUSES_ENUM_VALUES,
} from '../../constants/paymentInvoice'
import { IInvoiceStatsProps } from './interfaces'

export class InvoiceStats {
  invoiceId: string
  status: PAIMENT_INVOICE_STATUSES_ENUM
  invoiceDate: Date

  constructor(p: IInvoiceStatsProps) {
    this.invoiceId = p.invoiceId
    this.status = p.status
    this.invoiceDate = p.invoiceDate
  }

  static getDbSchema() {
    return {
      invoiceId: {
        type: mongoose.Types.ObjectId,
        ref: 'PaymentInvoice',
        required: true,
      },
      status: {
        type: String,
        enum: PAIMENT_INVOICE_STATUSES_ENUM_VALUES,
      },
      invoiceDate: {
        type: Date,
      },
    }
  }
}
