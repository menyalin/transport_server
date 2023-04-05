import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const PriceType = {
  price: Number,
  priceWOVat: Number,
}

const schema = new Schema(
  {
    order: { type: Types.ObjectId, unique: true }, // orderID of paymentPartId
    paymentInvoice: {
      type: Types.ObjectId,
      ref: 'PaymentInvoice',
      required: true,
    },
    company: { type: Types.ObjectId, ref: 'Company' },
    itemType: { type: String, enum: ['order', 'paymentPart'] },
    total: PriceType,
    totalByTypes: {
      type: Map,
      of: PriceType,
    },
  },
  { timestamps: true }
)

export default model('OrderInPaymentInvoice', schema, 'ordersInPaymentInvoices')
