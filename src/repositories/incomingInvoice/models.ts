import { IncomingInvoice, IncomingInvoiceOrder } from '@/domain/incomingInvoice'
import { model, Schema } from 'mongoose'

const incomingInvoiceSchema = new Schema(IncomingInvoice.dbSchema, {
  timestamps: true,
})
const incomingInvoiceOrderSchema = new Schema(IncomingInvoiceOrder.dbSchema, {
  timestamps: true,
})

export const IncomingInvoiceModel = model<IncomingInvoice>(
  'IncomingInvoice',
  incomingInvoiceSchema,
  'incomingInvoices'
)

export const IncomingInvoiceOrderModel = model<IncomingInvoiceOrder>(
  'IncomingInvoiceOrder',
  incomingInvoiceOrderSchema,
  'incomingInvoiceOrders'
)
