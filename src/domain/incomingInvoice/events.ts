import { createEventDefinition } from 'ts-bus'
import { IncomingInvoice } from './IncomingInvoice'

export enum INCOMING_INVOICE_EVENTS {
  updated = 'incomingInvoice:updated',
  ordersRemoved = 'incomingInvoice:orders_removed',
}

export const IncomingInvoiceUpdatedEvent =
  createEventDefinition<IncomingInvoice>()(INCOMING_INVOICE_EVENTS.updated)

export const OrdersRemovedFromIncomingInvoiceEvent = createEventDefinition<{
  orderIds: string[]
  invoiceId: string
}>()(INCOMING_INVOICE_EVENTS.ordersRemoved)
