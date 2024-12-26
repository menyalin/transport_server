import { objectIdSchema } from '@/shared/validationSchemes'
import { z } from 'zod'

export class IncomingInvoiceForOrderDTO {
  _id: string
  number: string
  date: string | Date
  status: string

  constructor(props: unknown) {
    const p = IncomingInvoiceForOrderDTO.validationSchema.parse(props)
    this._id = p._id.toString()
    this.number = p.number
    this.date = p.date
    this.status = p.status
  }

  static validationSchema = z.object({
    _id: objectIdSchema,
    number: z.string(),
    date: z.union([z.date(), z.string()]),
    status: z.string(),
  })
}
