import pkg from 'mongoose'
// import { TRUCK_KINDS_ENUM } from '../constants/truck.js'
// import { ORDER_ANALYTIC_TYPES_ENUM } from '../constants/order.js'
import {
  TARIFF_TYPES_ENUM,
  // TARIFF_ROUND_BY_HOURS_ENUM,
} from '../constants/tariff.js'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    isActive: { type: Boolean, default: true },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    note: { type: String },
    date: { type: Date, required: true },
    type: { type: String, enum: TARIFF_TYPES_ENUM },
    tks: [{ type: Types.ObjectId, ref: 'TkName' }],
    liftCapacity: [{ type: Number, required: true }],
    sum: Number,
    loading: { type: Types.ObjectId, ref: 'Address' },
    unloading: { type: Types.ObjectId, ref: 'Address' },
    loadingZone: { type: Types.ObjectId, ref: 'Zone' },
    unloadingZone: { type: Types.ObjectId, ref: 'Zone' },
  },
  { timestamps: true }
)

export default model('SalaryTariff', schema, 'salaryTariffs')

// truckKind: { type: String, enum: TRUCK_KINDS_ENUM, required: true },
// orderType: { type: String, enum: ORDER_ANALYTIC_TYPES_ENUM },
// includedPoints: { type: Number },
// // for 'directDistanceZones' type, and "loading"
// zones: [
//   {
//     distance: Number,
//     price: Number,
//     priceWOVat: Number,
//     sumVat: Number,
//   },
// ],
// // for "waiting", "orderType"
// includeHours: { type: Number },
// roundByHours: { type: Number, enum: TARIFF_ROUND_BY_HOURS_ENUM }, // Кратность округления по часам
// tariffBy: { type: String, enum: ['hour', 'day'] },
// // for 'return'
// percentOfTariff: { type: Number },
