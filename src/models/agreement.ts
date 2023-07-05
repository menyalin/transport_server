// @ts-nocheck
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    date: { type: Date, required: true },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    clients: [{ type: Types.ObjectId, ref: 'Partner' }],
    isOutsourceAgreement: { type: Boolean, default: false },
    calcWaitingByArrivalDateLoading: { type: Boolean, default: false },
    calcWaitingByArrivalDateUnloading: { type: Boolean, default: false },
    noWaitingPaymentForAreLateLoading: { type: Boolean, default: false },
    noWaitingPaymentForAreLateUnloading: { type: Boolean, default: false },
    outsourceCarriers: [{ type: Types.ObjectId, ref: 'TkName' }],
    cashPayment: { type: Boolean, default: false },
    vatRate: { type: Number, required: true },
    closed: { type: Boolean, default: false },
    useCustomPrices: { type: Boolean },
    usePriceWithVAT: { type: Boolean, default: false }, // нужно для определения типа (с/без НДС) при выгрузке в excel
    priceRequired: { type: Boolean, default: false },
    clientNumRequired: { type: Boolean, default: false },
    auctionNumRequired: { type: Boolean, default: false },
    note: String,
    commission: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default model('Agreement', schema, 'agreements')
