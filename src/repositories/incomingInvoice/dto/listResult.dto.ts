import { objectIdSchema } from '@/shared/validationSchemes'
import { z } from 'zod'

class IncomingInvoiceListItemDTO {
  _id: string
  company: string
  number: string
  date: Date
  plannedPayDate: Date | null
  agreementName: string
  status: string
  total: number = 0
  note: string | null = null

  constructor(invoice: unknown) {
    const parsedProps =
      IncomingInvoiceListItemDTO.validationSchema.parse(invoice)
    this._id = parsedProps?._id.toString()
    this.company = parsedProps.company.toString()
    this.number = parsedProps.number
    this.date = parsedProps.date
    this.plannedPayDate = parsedProps.plannedPayDate
    this.agreementName = parsedProps.agreementName
    this.status = parsedProps.status
    this.note = parsedProps.note ?? null
    this.total = parsedProps.total
  }

  static validationSchema = z.object({
    _id: objectIdSchema,
    company: objectIdSchema,
    number: z.string(),
    date: z.date(),
    plannedPayDate: z.date().nullable(),
    agreementName: z.string(),
    status: z.string(),
    total: z.number().default(0),
    note: z.string().nullable().optional(),
  })
}

export class ListResultDTO {
  totalCount: number
  items: IncomingInvoiceListItemDTO[]

  constructor(p: { totalCount: number; items: IncomingInvoiceListItemDTO[] }) {
    if (!p) {
      this.totalCount = 0
      this.items = []
    } else {
      const parsedProps = ListResultDTO.validationSchema.parse(p)
      this.totalCount = parsedProps.totalCount[0]?.count ?? 0
      this.items = parsedProps.items.map(
        (i) => new IncomingInvoiceListItemDTO(i)
      )
    }
  }

  static validationSchema = z.object({
    totalCount: z.array(z.object({ count: z.number() })),
    items: z.array(IncomingInvoiceListItemDTO.validationSchema),
  })
}
