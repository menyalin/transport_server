import pkg from 'mongoose'
import { Partner } from '../domain/partner/partner.domain'
const { Schema, model } = pkg

export default model(
  'Partner',
  new Schema(Partner.dbSchema(), { timestamps: true }),
  'partners'
)
