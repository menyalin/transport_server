import pkg from 'mongoose'
import { TRUCK_KINDS_ENUM } from '../constants/truck.js'
import { ORDER_ANALYTIC_TYPES_ENUM } from '../constants/order.js'
import {
  TARIFF_TYPES_ENUM,
  TARIFF_ROUND_BY_HOURS_ENUM,
} from '../constants/tariff.js'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: TARIFF_TYPES_ENUM },
    isActive: { type: Boolean, default: true },
    truckKind: { type: String, enum: TRUCK_KINDS_ENUM, required: true },
    liftCapacity: { type: Number, required: true },
    priceWOVat: { type: Number, required: true },
    sumVat: { type: Number, required: true },
    price: { type: Number, required: true },
    note: { type: String },
    document: { type: Types.ObjectId, ref: 'Document' },
    group: { type: String, required: true },
    groupNote: { type: String },
    groupVat: { type: Boolean, required: true },
    agreement: { type: Types.ObjectId, ref: 'Agreement', required: true },
    agreementVatRate: { type: Number, required: true },
    // for 'points' type
    loading: { type: Types.ObjectId, ref: 'Address' },
    unloading: { type: Types.ObjectId, ref: 'Address' },
    // for 'additionalPoints' type
    orderType: { type: String, enum: ORDER_ANALYTIC_TYPES_ENUM },
    includedPoints: { type: Number },
    // for 'directDistanceZones' type, and "loading"
    zones: [{
      distance: Number,
      price: Number,
      priceWOVat: Number,
      sumVat: Number,
    }],
    // for "waiting", "orderType"
    includeHours: { type: Number },
    roundByHours: { type: Number, enum: TARIFF_ROUND_BY_HOURS_ENUM }, // Кратность округления по часам
    tariffBy: { type: String, enum: ['hour', 'day'] },
    // for 'return'
    percentOfTariff: { type: Number },
  },
  { timestamps: true },
)

export default model('Tariff', schema, 'tariffs')
