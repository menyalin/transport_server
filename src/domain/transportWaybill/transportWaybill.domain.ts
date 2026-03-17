import dayjs from 'dayjs'
import z from 'zod'

export class TransportWaybill {
  number: string
  date: Date
  orderId: string
  note: string

  constructor(props: unknown) {
    const p = TransportWaybill.validationSchema.parse(props)
    this.number = p.number
    this.date = p.date
    this.orderId = p.orderId
    this.note = p.note
  }

  static get validationSchema() {
    return z.object({
      number: z.string(),
      date: z.union([z.string(), z.date()]).transform((v) => dayjs(v).toDate()),
      orderId: z.string(),
      note: z
        .string()
        .optional()
        .nullable()
        .transform((v) => v || ''),
    })
  }

  static get dbSchema() {
    return {
      number: String,
      date: Date,
      orderId: String,
      note: String,
    }
  }
}
