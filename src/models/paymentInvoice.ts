// @ts-nocheck
import pkg from 'mongoose'

import { PaymentInvoiceDomain } from '../domain/paymentInvoice/paymentInvoice.js'
const { Schema, model } = pkg

const schema = new Schema(PaymentInvoiceDomain.getDbSchema(), {
  timestamps: true,
})

export default model('PaymentInvoice', schema, 'paymentInvoices')
