import pkg from 'mongoose'
import { DOCS_REGISTRY_STATUSES_ENUM } from '../constants/docsRegistry.js'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    number: { type: Number, required: true },
    client: { type: Types.ObjectId, ref: 'Partner', required: true },
    status: { type: String, enum: DOCS_REGISTRY_STATUSES_ENUM },
    isActive: { type: Boolean, default: true },
    note: String,
  },
  { timestamps: true }
)

export default model('Fine', schema, 'fines')
