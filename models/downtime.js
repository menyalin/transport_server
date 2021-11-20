import { DOWNTIME_TYPES } from '../constants/enums.js'
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    truck: {
      type: Types.ObjectId,
      ref: 'Truck',
      required: true
    },
    type: {
      type: String,
      enum: DOWNTIME_TYPES,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    note: String,
    startPositionDate: {
      type: Date,
      required: true
    },
    endPositionDate: {
      type: Date,
      required: true
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export default model('Downtime', schema, 'downtimes')
