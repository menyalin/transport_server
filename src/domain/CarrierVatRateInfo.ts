import { z } from 'zod'

export class CarrierVatRateInfo {
  startPeriod: Date
  endPeriod?: Date | null
  vatRate: number
  note?: string | null

  constructor(p: unknown) {
    const parsed = CarrierVatRateInfo.validationSchema.parse(p)
    this.startPeriod = parsed.startPeriod
    this.endPeriod = parsed.endPeriod
    this.vatRate = parsed.vatRate
    this.note = parsed.note
  }

  static get validationSchema() {
    return z.object({
      startPeriod: z
        .union([z.date(), z.string()])
        .transform((v) => new Date(v)),
      endPeriod: z
        .union([z.date(), z.string(), z.null(), z.undefined()])
        .transform((v) => (v ? new Date(v) : null))
        .nullable()
        .optional(),
      vatRate: z.number(),
      note: z.string().optional().nullable(),
    })
  }

  static get dbSchema() {
    return {
      startPeriod: { type: Date, required: true },
      endPeriod: { type: Date, required: false },
      vatRate: { type: Number, required: true },
      note: String,
    }
  }
}
