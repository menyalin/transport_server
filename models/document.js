import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    name: String,
    date: Date,
    note: String,
    company: { type: Types.ObjectId, ref: 'Company' },
    partner: { type: Types.ObjectId, ref: 'Partner' },
    useInTariff: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default model('Document', schema, 'documents')
