import { PAIMENT_INVOICE_STATUSES_ENUM } from '../constants/paymentInvoice.js'
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    number: { type: String, required: true },
    client: { type: Types.ObjectId, ref: 'Partner', required: true },
    agreement: { type: Types.ObjectId, ref: 'Agreement', required: true },
    status: { type: String, enum: PAIMENT_INVOICE_STATUSES_ENUM },
    isActive: { type: Boolean, default: true },
    note: String,
  },
  { timestamps: true }
)

export default model('PaymentInvoice', schema, 'paymentInvoices')
