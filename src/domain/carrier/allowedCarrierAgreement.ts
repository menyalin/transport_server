import { objectIdSchema } from '@/shared/validationSchemes'
import { IAllowedCarrierAgreement } from './interfaces'
import { z } from 'zod'
import { Types } from 'mongoose'

export class AllowedCarrierAgreement implements IAllowedCarrierAgreement {
  agreement: Types.ObjectId | string
  startDate: Date
  endDate?: Date | null
  note?: string | null

  constructor(props: unknown) {
    const p = AllowedCarrierAgreement.validationSchema.parse(props)
    this.agreement = p.agreement
    this.startDate = p.startDate
    this.endDate = p.endDate
    this.note = p.note
  }

  static get validationSchema() {
    return z.object({
      agreement: objectIdSchema,
      startDate: z.union([z.date(), z.string()]).transform((v) => new Date(v)),
      endDate: z
        .union([z.date(), z.string()])
        .optional()
        .nullable()
        .transform((v) => (v ? new Date(v) : null)),
      note: z.string().optional().nullable(),
    })
  }

  static get dbSchema() {
    return {
      agreement: {
        type: Types.ObjectId,
        required: true,
      },
      startDate: { type: Date, required: true },
      endDate: Date,
      note: String,
    }
  }
}
