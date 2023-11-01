import { Types } from 'mongoose'
const PriceType = {
  price: Number,
  priceWOVat: Number,
}

export class OrderInPaymentInvoice {
  constructor() {}
  static dbSchema() {
    return {
      order: { type: Types.ObjectId, unique: true }, // orderID or paymentPartId
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
    }
  }
}
