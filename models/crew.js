import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    tkName: {
      type: Types.ObjectId,
      ref: 'TkName'
    },
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
    startDate: {
      type: Date,
      required: true
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

export default model('Crew', schema, 'crews')
