/* eslint-disable no-unused-vars */
import pkg from 'mongoose'
import { TRUCK_TYPES } from '../constants/enums.js'
const { Schema, model, Types } = pkg

const truckSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    model: {
      type: String
    },
    type: {
      type: String,
      enum: TRUCK_TYPES
    },
    regNum: {
      type: String
    },
    sts: {
      type: String
    },
    pts: {
      type: String
    },
    owner: {
      type: String
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export const Truck = model('Truck', truckSchema, 'trucks')
