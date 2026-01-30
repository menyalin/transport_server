import { model, Schema } from 'mongoose'
import { Partner as PartnerDomain } from '@/domain/partner/partner.domain'

const partnerSchema = new Schema(PartnerDomain.dbSchema(), { timestamps: true })

export const PartnerModel = model('Partner', partnerSchema, 'partners')
