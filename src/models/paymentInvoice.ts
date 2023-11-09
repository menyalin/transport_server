import { Schema, model } from 'mongoose'
import { PaymentInvoiceDomain } from '../domain/paymentInvoice/paymentInvoice'

const schema = new Schema(PaymentInvoiceDomain.getDbSchema(), {
  timestamps: true,
})

export default model<PaymentInvoiceDomain>(
  'PaymentInvoice',
  schema,
  'paymentInvoices'
)
