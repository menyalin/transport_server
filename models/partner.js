import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    name: {
      type: String
    },
    inn: String,
    company: {
      type: Types.ObjectId,
      ref: 'Company'
    },
    isClient: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export default model('Partner', schema, 'partners')
