import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    name: String,
    fullName: String,
    position: String,
    note: String,
    company: { type: Types.ObjectId, ref: 'Company' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default model('Worker', schema, 'workers')
