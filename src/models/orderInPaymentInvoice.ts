import { OrderInPaymentInvoice } from '../domain/paymentInvoice/orderInPaymentInvoice'
import { Schema, model } from 'mongoose'

const schema = new Schema(OrderInPaymentInvoice.dbSchema(), {
  timestamps: true,
})

export default model<OrderInPaymentInvoice>(
  'OrderInPaymentInvoice',
  schema,
  'ordersInPaymentInvoices'
)
