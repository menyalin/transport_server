import { z } from 'zod'

export class MedBook {
  number?: string | null
  issueDate?: Date | null
  certifiedBeforeDate?: Date | null
  annualCommisionDate?: Date | null
  note?: string | null

  constructor(props: unknown) {
    const p = MedBook.validationSchema.parse(props)
    this.number = p.number
    this.issueDate = p.issueDate
    this.certifiedBeforeDate = p.certifiedBeforeDate
    this.annualCommisionDate = p.annualCommisionDate
    this.note = p.note
  }
  static get validationSchema() {
    return z.object({
      number: z.string().optional().nullable(),
      issueDate: z.date().optional().nullable(),
      certifiedBeforeDate: z.date().optional().nullable(),
      annualCommisionDate: z.date().optional().nullable(),
      note: z.string().optional().nullable(),
    })
  }
  static get dbSchema() {
    return {
      number: String,
      issueDate: Date,
      certifiedBeforeDate: Date,
      annualCommisionDate: Date,
      note: String,
    }
  }
}
