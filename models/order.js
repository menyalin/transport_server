import pkg from 'mongoose'
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
import { RoutePoint } from '../values/routePoint.js'

const prices = [PriceDTO.modelFields()]

const paymentPart = {
  client: { type: Types.ObjectId, ref: 'Partner', required: true },
  agreement: { type: Types.ObjectId, ref: 'Agreement', required: true },
  note: String,
  ...PriceDTO.modelFields(),
}

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
const docsState = {
  getted: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: null,
  },
}

const paymentToDriver = {
  sum: Number,
  note: String,
  worker: {
    type: Types.ObjectId,
    ref: 'Worker',
  },
}

const docs = [
  {
    addToRegistry: {
      type: Boolean,
      default: false,
    },
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
  auctionNum: String,
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
    route: [RoutePoint.getDbSchema()],
    cargoParams: cargoParams,
    reqTransport: reqTransport,
    state,
    paymentParts: [paymentPart],
    analytics,
    docsState,
    paymentToDriver,
    isActive: { type: Boolean, default: true },
    isDisabled: { type: Boolean, default: false },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    manager: { type: Types.ObjectId, ref: 'User' },
    note: { type: String },
    noteAccountant: { type: String },
  },
  // eslint-disable-next-line comma-dangle
  { timestamps: true }
)

export default model('Order', schema, 'orders')
