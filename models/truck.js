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
    brand: {
      type: String
    },
    model: {
      type: String
    },
    issueYear: String,
    endServiceDate: Date,
    startServiceDate: Date,
    type: {
      type: String,
      enum: TRUCK_TYPES
    },
    tkName: {
      type: Types.ObjectId,
      ref: 'TkName'
    },
    regNum: {
      type: String
    },
    win: String,
    sts: {
      type: String
    },
    stsDate: Date,
    pts: {
      type: String
    },
    owner: {
      type: String
    },
    order: {
      type: Number,
      default: 50
    },
    volumeFuel: { type: Number, default: 0 },
    volumeRef: { type: Number, default: 0 },
    liftCapacity: { type: Number, default: 0 },
    pltCount: { type: Number, default: 0 },
    company: {
      type: Types.ObjectId,
      ref: 'Company'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    note: String,
    allowUseTrailer: {
      type: Boolean,
      default: false
    },
    allowedDrivers: [
      {
        type: Types.ObjectId,
        ref: 'Driver'
      }
    ]
  },
  { timestamps: true }
)

export const Truck = model('Truck', truckSchema, 'trucks')
