import { createEventDefinition } from 'ts-bus'
import { OrderInPaymentInvoice } from './orderInPaymentInvoice'

export enum PAYMENT_INVOICE_EVENTS {
  ordersAdded = 'payment_invoice:orders_added',
  ordersDeleted = 'payment_invoice:orders_deleted',
}

export const OrdersAddedToPaymentInvoiceEvent = createEventDefinition<
  OrderInPaymentInvoice[]
>()(PAYMENT_INVOICE_EVENTS.ordersAdded)

export const OrdersDeletedFromPaymentInvoiceEvent = createEventDefinition<
  string[]
>()(PAYMENT_INVOICE_EVENTS.ordersDeleted)
