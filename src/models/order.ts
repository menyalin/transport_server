import pkg from 'mongoose'
import {
  TRUCK_KINDS_ENUM_VALUES,
  TRUCK_LIFT_CAPACITY_TYPES,
  LOAD_DIRECTION_ENUM_VALUES,
} from '../constants/truck'
import {
  DOCUMENT_TYPES_ENUM,
  DOCUMENT_STATUSES_ENUM,
} from '../constants/accounting'
import {
  ORDER_STATUSES_ENUM,
  ORDER_ANALYTIC_TYPES_ENUM,
} from '../constants/order'

const { Schema, model, Types } = pkg
import { RoutePoint } from '../values/order/routePoint'
import { Client } from '../domain/order/client'
import { OrderPrice } from '../domain/order/orderPrice'
import { OrderPaymentPart } from '../domain/order/paymentPart'

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
    enum: TRUCK_KINDS_ENUM_VALUES,
  },
  liftCapacity: {
    type: Number,
    enum: TRUCK_LIFT_CAPACITY_TYPES,
  },
  loadDirection: {
    type: String,
    enum: LOAD_DIRECTION_ENUM_VALUES,
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
    client: Client.dbSchema(),
    prePrices: [OrderPrice.dbSchema],
    prices: [OrderPrice.dbSchema],
    finalPrices: [OrderPrice.dbSchema],
    outsourceCosts,
    confirmedCrew,
    route: [RoutePoint.getDbSchema()],
    cargoParams: cargoParams,
    reqTransport: reqTransport,
    state,
    paymentParts: [OrderPaymentPart.dbSchema],
    analytics,
    docsState,
    paymentToDriver,
    isActive: { type: Boolean, default: true },
    isDisabled: { type: Boolean, default: false },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    note: { type: String },
    noteAccountant: { type: String },
  },
  { timestamps: true }
)

export const OrderModel = model('Order', schema, 'orders')
