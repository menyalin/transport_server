// @ts-nocheck
import { DOWNTIME_TYPES } from '../constants/enums'
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    truck: { type: Types.ObjectId, ref: 'Truck', required: true },
    type: { type: String, enum: DOWNTIME_TYPES, required: true },
    title: { type: String, required: true },
    partner: { type: Types.ObjectId, ref: 'Partner' },
    address: { type: Types.ObjectId, ref: 'Address' },
    note: String,
    startPositionDate: { type: Date, required: true },
    endPositionDate: { type: Date, required: true },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    inOrderTime: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default model('Downtime', schema, 'downtimes')
