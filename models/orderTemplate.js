import {
  POINT_TYPES,
  TRUCK_KINDS,
  TRUCK_LIFT_CAPACITY_TYPES,
  TRUCK_LOAD_DIRECTION
} from '../constants/enums.js'
import { ORDER_STATUSES_ENUM } from '../constants/orderStatuses.js'
import pkg from 'mongoose'

const { Schema, model, Types } = pkg

const point = {
  type: {
    type: String,
    enum: POINT_TYPES
  },
  address: {
    type: Types.ObjectId,
    ref: 'Address'
  },
  note: String
}

const cargoParams = {
  weight: Number,
  places: Number,
  note: String,
  tRegime: String
}

const state = {
  status: {
    type: String,
    enum: ORDER_STATUSES_ENUM
  },
  warning: {
    type: Boolean,
    default: false
  },
  driverNotified: {
    type: Boolean,
    default: false
  },
  clientNotified: {
    type: Boolean,
    default: false
  }
}

const reqTransport = {
  kind: {
    type: String,
    enum: TRUCK_KINDS
  },
  liftCapacity: {
    type: Number,
    enum: TRUCK_LIFT_CAPACITY_TYPES
  },
  loadDirection: {
    type: String,
    enum: TRUCK_LOAD_DIRECTION
  }
}

// const confirmedCrew = {
//   truck: { type: Types.ObjectId, ref: 'Truck' },
//   trailer: { type: Types.ObjectId, ref: 'Truck' },
//   driver: { type: Types.ObjectId, ref: 'Driver' }
// }

const schema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    client: {
      type: Types.ObjectId,
      ref: 'Partner'
    },
    // startPositionDate: {
    //   // дата для отображения в таблице распределения
    //   type: Date,
    //   required: true
    // },
    // confirmedCrew,
    route: [point],
    cargoParams: cargoParams,
    reqTransport: reqTransport,
    state,
    isActive: {
      type: Boolean,
      default: true
    },

    company: { type: Types.ObjectId, ref: 'Company', required: true },
    manager: { type: Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
)

export default model('OrderTemlate', schema, 'orderTemplates')
