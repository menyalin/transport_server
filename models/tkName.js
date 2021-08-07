import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    name: String,
    company: {
      type: Types.ObjectId,
      ref: 'Company'
    }
  },
  { timestamps: true }
)

export default model('TkName', schema, 'tknames')
