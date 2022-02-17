import pkg from 'mongoose'
// import { CALC_METHODS_ENUM } from '../constants/calcMethods.js'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    clients: [{ type: Types.ObjectId, ref: 'Partner' }],
    vatRate: {
      type: Number,
      required: true
    },
    closed: {
      type: Boolean,
      default: false
    },
    useCustomPrices: {
      type: Boolean
    },
    date: {
      type: Date,
      required: true
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company',
      required: true
    },
    note: String,
    isActive: {
      type: Boolean,
      default: true
    },
    zones: [
      {
        value: Number,
        price: Number
      }
    ]
  },
  { timestamps: true }
)

export default model('Agreement', schema, 'agreements')
