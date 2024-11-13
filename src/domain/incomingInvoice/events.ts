import { createEventDefinition } from 'ts-bus'
import { IncomingInvoice } from './IncomingInvoice'

export enum INCOMING_INVOICE_EVENTS {
  updated = 'incomingInvoice:updated',
}

export const IncomingInvoiceUpdatedEvent =
  createEventDefinition<IncomingInvoice>()(INCOMING_INVOICE_EVENTS.updated)
