import { z } from 'zod'

export class PermitsInfo {
  dayPermitNumber?: string | null
  dayPermitExpDate?: Date | null
  dayPermitZone?: string | null
  nightPermitNumber?: string | null
  nightPermitExpDate?: Date | null
  nightPermitZone?: string | null

  constructor(props: unknown) {
    const p = PermitsInfo.validationSchema.parse(props)
    this.dayPermitNumber = p.dayPermitNumber
    this.dayPermitExpDate = p.dayPermitExpDate
    this.dayPermitZone = p.dayPermitZone
    this.nightPermitNumber = p.nightPermitNumber
    this.nightPermitExpDate = p.nightPermitExpDate
    this.nightPermitZone = p.nightPermitZone
  }
  static get validationSchema() {
    return z.object({
      dayPermitNumber: z.string().optional().nullable(),
      dayPermitExpDate: z.date().optional().nullable(),
      dayPermitZone: z.string().optional().nullable(),
      nightPermitNumber: z.string().optional().nullable(),
      nightPermitExpDate: z.date().optional().nullable(),
      nightPermitZone: z.string().optional().nullable(),
    })
  }

  static get dbSchema() {
    return {
      dayPermitNumber: String,
      dayPermitExpDate: Date,
      dayPermitZone: String,
      nightPermitNumber: String,
      nightPermitExpDate: Date,
      nightPermitZone: String,
    }
  }
}
