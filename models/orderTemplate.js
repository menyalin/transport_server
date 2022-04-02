import {
  POINT_TYPES,
  TRUCK_KINDS,
  TRUCK_LIFT_CAPACITY_TYPES,
  TRUCK_LOAD_DIRECTION,
} from '../constants/enums.js'
import { ORDER_STATUSES_ENUM } from '../constants/orderStatuses.js'
import { ORDER_ANALYTIC_TYPES_ENUM } from '../constants/orderAnalyticTypes.js'

import pkg from 'mongoose'

const { Schema, model, Types } = pkg

const point = {
  type: {
    type: String,
    enum: POINT_TYPES,
  },
  address: {
    type: Types.ObjectId,
    ref: 'Address',
  },
  fixedTime: String,
  offsetDays: Number,
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
    enum: TRUCK_KINDS,
  },
  liftCapacity: {
    type: Number,
    enum: TRUCK_LIFT_CAPACITY_TYPES,
  },
  loadDirection: {
    type: String,
    enum: TRUCK_LOAD_DIRECTION,
  },
}

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    client: {
      type: Types.ObjectId,
      ref: 'Partner',
    },
    analytics,
    fixedTimeSlots: { type: Boolean, default: false },
    route: [point],
    cargoParams: cargoParams,
    reqTransport: reqTransport,
    state,
    isActive: {
      type: Boolean,
      default: true,
    },

    company: { type: Types.ObjectId, ref: 'Company', required: true },
    manager: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export default model('OrderTemlate', schema, 'orderTemplates')
