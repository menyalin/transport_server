// @ts-nocheck
import pkg from 'mongoose'

import { PaymentInvoiceDomain } from '../domain/paymentInvoice/paymentInvoice'
const { Schema, model } = pkg

const schema = new Schema(PaymentInvoiceDomain.getDbSchema(), {
  timestamps: true,
})

export default model('PaymentInvoice', schema, 'paymentInvoices')
