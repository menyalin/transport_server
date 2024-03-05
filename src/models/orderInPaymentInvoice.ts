import { Schema, model } from 'mongoose'
import { OrderInPaymentInvoice } from '../domain/paymentInvoice/orderInPaymentInvoice'

const schema = new Schema(OrderInPaymentInvoice.dbSchema, { timestamps: true })

export default model<OrderInPaymentInvoice>(
  'OrderInPaymentInvoice',
  schema,
  'ordersInPaymentInvoices'
)
