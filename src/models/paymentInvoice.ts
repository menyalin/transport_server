import { Schema, model } from 'mongoose'
import { PaymentInvoiceDomain } from '../domain/paymentInvoice/paymentInvoice'

const schema = new Schema(PaymentInvoiceDomain.dbSchema, {
  timestamps: true,
})

export default model<PaymentInvoiceDomain>(
  'PaymentInvoice',
  schema,
  'paymentInvoices'
)
