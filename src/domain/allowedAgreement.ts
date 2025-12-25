import z from 'zod'
import { Types } from 'mongoose'
import { objectIdSchema } from '@/shared/validationSchemes'

export interface IAllowedAgreement {
  agreement: string | Types.ObjectId
  startDate: Date
  endDate?: Date | null
  note?: string | null
}

export class AllowedAgreement implements IAllowedAgreement {
  agreement: Types.ObjectId | string
  startDate: Date
  endDate?: Date | null
  note?: string | null

  constructor(props: unknown) {
    const p = AllowedAgreement.validationSchema.parse(props)
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
