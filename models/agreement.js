import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    clients: [
      {
        type: Types.ObjectId,
        ref: 'Partner'
      }
    ],
    vatRate: {
      type: Number,
      required: true
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
    }
  },
  { timestamps: true }
)

export default model('Agreement', schema, 'agreements')
