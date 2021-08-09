/* eslint-disable no-unused-vars */
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const addressSchema = new Schema(
  {
    name: {
      type: String
    },
    shortName: String,
    note: String,
    label: {
      type: String
    },
    geo: {
      type: { type: String },
      coordinates: [Number]
    },
    isShipmentPlace: {
      type: Boolean,
      default: false
    },
    isDeliveryPlace: {
      type: Boolean,
      default: false
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

addressSchema.index(
  { label: 'text' },
  {
    default_language: 'russian'
  }
)
addressSchema.index({ geo: '2dsphere' })

export const Address = model('Address', addressSchema, 'addresses')
