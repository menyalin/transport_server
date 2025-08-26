import { createEventDefinition } from 'ts-bus'
import { OrderInPaymentInvoice } from './orderInPaymentInvoice'
import { PaymentInvoiceDomain } from './paymentInvoice'

export enum PAYMENT_INVOICE_EVENTS {
  ordersAdded = 'payment_invoice:orders_added',
  ordersDeleted = 'payment_invoice:orders_deleted',
  sended = 'payment_invoice:sended',
  paid = 'payment_invoice:paid',
}

export const OrdersAddedToPaymentInvoiceEvent = createEventDefinition<
  OrderInPaymentInvoice[]
>()(PAYMENT_INVOICE_EVENTS.ordersAdded)

export const OrdersDeletedFromPaymentInvoiceEvent = createEventDefinition<
  string[]
>()(PAYMENT_INVOICE_EVENTS.ordersDeleted)

export const PaymentInvoiceSendedEvent =
  createEventDefinition<PaymentInvoiceDomain>()(PAYMENT_INVOICE_EVENTS.sended)

export const PaymentInvoicePaidEvent =
  createEventDefinition<PaymentInvoiceDomain>()(PAYMENT_INVOICE_EVENTS.paid)
