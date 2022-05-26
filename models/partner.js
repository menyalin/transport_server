import pkg from 'mongoose'
import { PARTNER_GROUPS_ENUM } from '../constants/partner.js'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    name: String,
    inn: String,
    company: { type: Types.ObjectId, ref: 'Company' },
    contacts: String,
    group: { type: String, enum: [...PARTNER_GROUPS_ENUM, null] },
    isClient: { type: Boolean, default: false },
    isService: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default model('Partner', schema, 'partners')
