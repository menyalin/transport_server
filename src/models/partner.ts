import { model, Schema } from 'mongoose'
import { Partner as PartnerDomain } from '../domain/partner/partner.domain'
import { IParterProps } from '../domain/partner/interfaces'

const partnerSchema = new Schema(PartnerDomain.dbSchema(), { timestamps: true })

export const PartnerModel = model<IParterProps>(
  'Partner',
  partnerSchema,
  'partners'
)

