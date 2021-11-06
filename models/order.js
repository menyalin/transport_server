import {
  POINT_TYPES,
  TRUCK_KINDS,
  TRUCK_LIFT_CAPACITY_TYPES,
  TRUCK_LOAD_DIRECTION
} from '../constants/enums.js'
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
  plannedDate: {
    type: Date
  },
  note: String
}

const cargoParams = {
  weight: Number,
  places: Number,
  note: String,
  tRegime: String
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
    enam: TRUCK_LOAD_DIRECTION
  }
}

const schema = new Schema(
  {
    startPositionDate: {
      // дата для отображения в таблице распределения
      type: Date,
      required: true
    },
    route: [point],
    cargoParams: cargoParams,
    reqTransport: reqTransport,
    isActive: {
      type: Boolean,
      default: false
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    endPositionDate: {
      // дата для отображения в таблице распределения
      type: Date,
      required: true
    },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    truck: { type: Types.ObjectId, ref: 'Truck' },
    manager: { type: Types.ObjectId, ref: 'User' },
    trailer: { type: Types.ObjectId, ref: 'Truck' },
    driver: { type: Types.ObjectId, ref: 'Driver' }
  },
  { timestamps: true }
)

export default model('Order', schema, 'orders')
