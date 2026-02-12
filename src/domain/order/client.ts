import { Schema } from 'mongoose'
import { z } from 'zod'
import { objectIdSchema } from '@/shared/validationSchemes'
import { OrderVatRateInfo } from '../OrderVatRateInfo'

export class Client {
  client: string
  num?: string
  directiveAgreement: boolean
  auctionNum?: string
  agreement: string | null
  vatRateInfo?: OrderVatRateInfo

  constructor(props: unknown) {
    const p = Client.validationSchema.parse(props)
    this.client = p.client.toString()
    this.num = p.num
    this.auctionNum = p.auctionNum
    this.directiveAgreement = p.directiveAgreement
    this.agreement = p.agreement?.toString() || null
    if (p.vatRateInfo) this.vatRateInfo = p.vatRateInfo
  }

  toJSON() {
    return {
      client: this.client,
      num: this.num,
      auctionNum: this.auctionNum,
      agreement: this.agreement,
      directiveAgreement: this.directiveAgreement,
      vatRateInfo: this.vatRateInfo ?? undefined,
    }
  }

  static get validationSchema() {
    return z.object({
      client: objectIdSchema,
      num: z.string().optional(),
      auctionNum: z.string().optional(),
      directiveAgreement: z
        .boolean()
        .optional()
        .default(false)
        .transform((v) => Boolean(v)),
      agreement: objectIdSchema.nullable(),
      vatRateInfo: OrderVatRateInfo.validationSchema.optional(),
    })
  }

  static dbSchema() {
    return {
      client: {
        type: Schema.Types.ObjectId,
        ref: 'Partner',
      },
      num: String,
      auctionNum: String,
      directiveAgreement: {
        type: Boolean,
        default: false,
      },
      agreement: {
        type: Schema.Types.ObjectId,
        ref: 'Agreement',
      },
      vatRateInfo: { type: OrderVatRateInfo.dbSchema, default: undefined },
    }
  }
}
