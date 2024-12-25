import { CarrierAgreement } from '@/domain/carrierAgreement'
import { model, Schema } from 'mongoose'

const schema = new Schema(CarrierAgreement.dbSchema, {
  timestamps: true,
})

export const CarrierAgreementModel = model<CarrierAgreement>(
  'CarrierAgreement',
  schema,
  'carrierAgreements'
)
