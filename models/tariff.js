import pkg from 'mongoose'
import { TRUCK_KINDS_ENUM } from '../constants/truck.js'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    date: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    loading: { type: Types.ObjectId, ref: 'Address', required: true },
    unloading: { type: Types.ObjectId, ref: 'Address', required: true },
    truckKind: { type: String, enum: TRUCK_KINDS_ENUM, required: true },
    liftCapacity: { type: Number, required: true },
    priceWOVat: { type: Number, required: true },
    sumVat: { type: Number, required: true },
    price: { type: Number, required: true },
    note: { type: String },
    group: { type: String, required: true },
    groupNote: { type: String },
    groupVat: { type: Boolean, required: true },
    agreement: { type: Types.ObjectId, ref: 'Agreement', required: true },
    agreementVatRate: { type: Number, required: true },
  },
  { timestamps: true },
)

export default model('Tariff', schema, 'tariffs')
