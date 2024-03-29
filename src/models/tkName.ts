// @ts-nocheck
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    name: {
      type: String,
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company',
    },
    outsource: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

export default model('TkName', schema, 'tknames')
