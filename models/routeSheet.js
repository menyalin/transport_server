import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    truck: {
      type: Types.ObjectId,
      ref: 'Truck'
    },
    trailer: {
      type: Types.ObjectId,
      ref: 'Truck'
    },
    driver: {
      type: Types.ObjectId,
      ref: 'Driver'
    },
    driver2: {
      type: Types.ObjectId,
      ref: 'Driver'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    manager: {
      type: Types.ObjectId,
      ref: 'User'
    },
    note: {
      type: String
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company'
    }
  },
  { timestamps: true }
)

export default model('RouteSheet', schema, 'routesheets')
