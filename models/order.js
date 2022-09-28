import pkg from 'mongoose'
import { POINT_TYPES } from '../constants/enums.js'
import PriceDTO from '../dto/price.dto.js'

import {
  TRUCK_KINDS_ENUM,
  TRUCK_LIFT_CAPACITY_TYPES,
  LOAD_DIRECTION_ENUM,
} from '../constants/truck.js'
import {
  DOCUMENT_TYPES_ENUM,
  DOCUMENT_STATUSES_ENUM,
} from '../constants/accounting.js'
import {
  ORDER_STATUSES_ENUM,
  ORDER_ANALYTIC_TYPES_ENUM,
} from '../constants/order.js'

const { Schema, model, Types } = pkg

const prices = [PriceDTO.modelFields()]

const outsourceCosts = [
  {
    type: {
      type: String,
      required: true,
    },
    priceWOVat: { type: Number },
    sumVat: { type: Number },
    price: { type: Number },
    note: String,
    cashPayment: Boolean,
  },
]

const docs = [
  {
    type: {
      type: String,
      enum: DOCUMENT_TYPES_ENUM,
    },
    number: {
      type: String,
    },
    note: String,
    status: {
      type: String,
      enum: DOCUMENT_STATUSES_ENUM,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
]

const client = {
  client: {
    type: Types.ObjectId,
    ref: 'Partner',
  },
  num: String,
  agreement: {
    type: Types.ObjectId,
    ref: 'Agreement',
  },
}

const grade = {
  grade: Number,
  note: String,
}
const analytics = {
  type: { type: String, enum: ORDER_ANALYTIC_TYPES_ENUM },
  distanceRoad: { type: Number },
  distanceDirect: { type: Number },
}
const point = {
  type: {
    type: String,
    enum: POINT_TYPES,
  },
  address: {
    type: Types.ObjectId,
    ref: 'Address',
  },
  plannedDate: Date,
  arrivalDate: Date,
  departureDate: Date,
  plannedDateDoc: Date,
  arrivalDateDoc: Date,
  departureDateDoc: Date,
  isReturn: {
    type: Boolean,
    default: false,
  },
  note: String,
}

const cargoParams = {
  weight: Number,
  places: Number,
  note: String,
  tRegime: String,
}

const state = {
  status: {
    type: String,
    enum: ORDER_STATUSES_ENUM,
  },
  warning: {
    type: Boolean,
    default: false,
  },
  driverNotified: {
    type: Boolean,
    default: false,
  },
  clientNotified: {
    type: Boolean,
    default: false,
  },
}

const reqTransport = {
  kind: {
    type: String,
    enum: TRUCK_KINDS_ENUM,
  },
  liftCapacity: {
    type: Number,
    enum: TRUCK_LIFT_CAPACITY_TYPES,
  },
  loadDirection: {
    type: String,
    enum: LOAD_DIRECTION_ENUM,
  },
}

const confirmedCrew = {
  truck: { type: Types.ObjectId, ref: 'Truck' },
  trailer: { type: Types.ObjectId, ref: 'Truck' },
  driver: { type: Types.ObjectId, ref: 'Driver' },
  outsourceAgreement: { type: Types.ObjectId, ref: 'Agreement' },
  tkName: { type: Types.ObjectId, ref: 'TkName' },
}

const schema = new Schema(
  {
    startPositionDate: { type: Date, required: true },
    grade,
    docs,
    client,
    prePrices: prices,
    prices,
    finalPrices: prices,
    outsourceCosts,
    confirmedCrew,
    route: [point],
    cargoParams: cargoParams,
    reqTransport: reqTransport,
    state,
    analytics,
    isActive: { type: Boolean, default: true },
    isDisabled: { type: Boolean, default: false },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    manager: { type: Types.ObjectId, ref: 'User' },
    note: { type: String },
  },
  { timestamps: true },
)

export default model('Order', schema, 'orders')
