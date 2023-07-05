/* eslint-disable no-unused-vars */
import pkg from 'mongoose'
import {
  TRUCK_TYPES_ENUM,
  TRUCK_KINDS_ENUM,
  TRUCK_LIFT_CAPACITY_TYPES,
} from '../constants/truck.js'
import additionalNotification from './_additionalNotification.js'

const { Schema, model, Types } = pkg

const additionalDetails = {
  diagnosticCardExpDate: Date,
  diagnosticCardNote: String,
  platonNumber: String,
  platonDate: Date,
  tachographNumber: String,
  tachographExpDate: Date,
  tachographNote: String,
  transponderNumber: String,
  transponderDate: Date,
  fuelCardNumber: String,
  fuelCardDate: Date,
  fuelCardNote: String,
}

const allowedDriver = {
  driver: {
    type: Types.ObjectId,
    ref: 'Driver',
  },
  isPermanent: {
    type: Boolean,
    default: false,
  },
}

const insurance = {
  osagoNum: String,
  osagoExpDate: Date,
  osagoCompany: String,
  kaskoNum: String,
  kaskoExpDate: Date,
  kaskoCompany: String,
  leasingСompany: String,
}

const permits = {
  dayPermitNumber: String,
  dayPermitExpDate: Date,
  dayPermitZone: String,
  nightPermitNumber: String,
  nightPermitExpDate: Date,
  nightPermitZone: String,
}

const truckSchema = new Schema(
  {
    additionalNotifications: [additionalNotification],
    additionalDetails,
    insurance,
    permits,
    brand: { type: String },
    model: { type: String },
    brigadier: { type: Types.ObjectId, ref: 'Driver' },
    mechanic: { type: Types.ObjectId, ref: 'Driver' },
    sanitaryPassportExpDate: Date,
    sanitaryPassportNote: String,
    issueYear: Number,
    startServiceDate: Date,
    endServiceDate: Date,
    type: { type: String, enum: TRUCK_TYPES_ENUM },
    kind: { type: String, enum: [...TRUCK_KINDS_ENUM, null] },
    liftCapacityType: { type: Number, enum: TRUCK_LIFT_CAPACITY_TYPES },
    tkName: { type: Types.ObjectId, ref: 'TkName' },
    regNum: String,
    win: String,
    sts: String,
    stsDate: Date,
    pts: String,
    owner: String,
    order: { type: Number, default: 50 },
    volumeFuel: { type: Number, default: 0 },
    volumeRef: { type: Number, default: 0 },
    liftCapacity: { type: Number, default: 0 },
    pltCount: { type: Number, default: 0 },
    company: { type: Types.ObjectId, ref: 'Company' },
    hideInFines: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    note: String,
    allowUseTrailer: { type: Boolean, default: false },
    allowedDrivers: [allowedDriver],
  },
  { timestamps: true },
)

export const Truck = model('Truck', truckSchema, 'trucks')
