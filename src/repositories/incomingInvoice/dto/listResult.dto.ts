import { objectIdSchema } from '@/shared/validationSchemes'
import { z } from 'zod'

class IncomingInvoiceListItemDTO {
  _id: string
  company: string
  number: string
  date: Date
  plannedPayDate: Date | null
  agreementName: string
  carrierName?: string
  status: string
  ordersCount: number = 0
  priceWithVat: number = 0
  priceWOVat: number = 0
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
    this.carrierName = parsedProps.carrierName
    this.status = parsedProps.status
    this.note = parsedProps.note ?? null
    this.ordersCount = parsedProps.ordersCount
    this.priceWithVat = parsedProps.priceWithVat
    this.priceWOVat = parsedProps.priceWOVat
  }

  static validationSchema = z.object({
    _id: objectIdSchema,
    company: objectIdSchema,
    number: z.string(),
    date: z.date(),
    plannedPayDate: z.date().nullable(),
    agreementName: z.string(),
    carrierName: z.string().optional(),
    status: z.string(),
    ordersCount: z.number().default(0),
    priceWithVat: z.number().default(0),
    priceWOVat: z.number().default(0),
    note: z.string().nullable().optional(),
  })
}

export class ListResultDTO {
  count: number
  routesCount: number
  totalSumWOVat: number
  totalSum: number
  items: IncomingInvoiceListItemDTO[]

  constructor(p: { totalCount: number; items: IncomingInvoiceListItemDTO[] }) {
    if (!p) {
      this.count = 0
      this.routesCount = 0
      this.totalSumWOVat = 0
      this.totalSum = 0
      this.items = []
    } else {
      const parsedProps = ListResultDTO.validationSchema.parse(p)
      this.count = parsedProps.analytics[0]?.totalCount ?? 0
      this.routesCount = parsedProps.analytics[0]?.routesCount ?? 0
      this.totalSumWOVat = parsedProps.analytics[0]?.priceWOVat ?? 0
      this.totalSum = parsedProps.analytics[0]?.priceWithVat ?? 0
      this.items = parsedProps.items.map(
        (i) => new IncomingInvoiceListItemDTO(i)
      )
    }
  }

  static validationSchema = z.object({
    analytics: z.array(
      z.object({
        totalCount: z.number(),
        routesCount: z.number(),
        priceWOVat: z.number(),
        priceWithVat: z.number(),
      })
    ),
    items: z.array(IncomingInvoiceListItemDTO.validationSchema),
  })
}
