import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    order: { type: Types.ObjectId, unique: true }, // orderID of paymentPartId
    paymentInvoice: {
      type: Types.ObjectId,
      ref: 'PaymentInvoice',
      required: true,
    },
    company: { type: Types.ObjectId, ref: 'Company' },
  },
  { timestamps: true }
)

export default model('OrderInPaymentInvoice', schema, 'ordersInPaymentInvoices')
