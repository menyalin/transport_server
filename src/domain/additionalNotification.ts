import { z } from 'zod'

export class AdditionalNotification {
  title?: string | null
  expDate?: Date | null
  daysBeforeRemind?: number | null
  note?: string | null

  constructor(props: unknown) {
    const p = AdditionalNotification.validationSchema.parse(props)
    this.title = p.title
    this.expDate = p.expDate
    this.daysBeforeRemind = p.daysBeforeRemind
    this.note = p.note
  }
  static get validationSchema() {
    return z.object({
      title: z.string().optional().nullable(),
      expDate: z.date().optional().nullable(),
      daysBeforeRemind: z.number().optional().nullable(),
      note: z.string().optional().nullable(),
    })
  }
  static get dbSchema() {
    return {
      title: String,
      expDate: Date,
      daysBeforeRemind: Number,
      note: String,
    }
  }
}
