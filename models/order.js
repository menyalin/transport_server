import pkg from 'mongoose'

const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    startPositionDate: {
      // дата для отображения в таблице распределения
      type: Date,
      required: true
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
    trailer: { type: Types.ObjectId, ref: 'Truck' },
    driver: { type: Types.ObjectId, ref: 'Driver' }
  },
  { timestamps: true }
)

export default model('Order', schema, 'orders')
