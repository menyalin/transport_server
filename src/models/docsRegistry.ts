import { Schema, model, Types } from 'mongoose'
import { DOCS_REGISTRY_STATUSES_ENUM } from '../constants/docsRegistry'

const schema = new Schema(
  {
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    number: { type: Number, required: true },
    client: { type: Types.ObjectId, ref: 'Partner', required: true },
    agreement: { type: Types.ObjectId, ref: 'Agreement' },
    placeForTransferDocs: {
      type: Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    status: { type: String, enum: DOCS_REGISTRY_STATUSES_ENUM },
    isActive: { type: Boolean, default: true },
    note: String,
  },
  { timestamps: true }
)

export default model('DocsRegistry', schema, 'docsRegistries')
