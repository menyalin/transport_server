import {
  TRUCK_KINDS_ENUM_VALUES,
  TRUCK_LIFT_CAPACITY_TYPES,
  LOAD_DIRECTION_ENUM_VALUES,
} from '../constants/truck'
import {
  ORDER_STATUSES_ENUM,
  ORDER_ANALYTIC_TYPES_ENUM,
} from '../constants/order'

import pkg from 'mongoose'
import { TemplateRoutePoint } from '../values/order/templateRoutePoint'

const { Schema, model, Types } = pkg

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
    route: [TemplateRoutePoint.getDbSchema()],
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
  { timestamps: true }
)

export default model('OrderTemlate', schema, 'orderTemplates')
