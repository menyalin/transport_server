/* eslint-disable no-unused-vars */
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const addressSchema = new Schema(
  {
    name: String,
    shortName: String,
    note: String,
    label: String,
    zones: [{ type: Types.ObjectId, ref: 'Zone' }],
    contacts: String,
    geo: { type: { type: String }, coordinates: [Number] },
    isShipmentPlace: { type: Boolean, default: false },
    isDeliveryPlace: { type: Boolean, default: false },
    isService: { type: Boolean, default: false },
    company: { type: Types.ObjectId, ref: 'Company' },
    isActive: { type: Boolean, default: true },
    partner: { type: Types.ObjectId, ref: 'Partner' },
  },
  { timestamps: true },
)

addressSchema.index(
  { name: 'text', label: 'text', shortName: 'text' },
  { default_language: 'russian' },
)
addressSchema.index({ geo: '2dsphere' })

export const Address = model('Address', addressSchema, 'addresses')
