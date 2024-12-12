import { objectIdSchema } from '@/shared/validationSchemes'
import { z } from 'zod'

class Item {
  _id: string
  orderId: string
  orderNum?: string | null
  orderDate: string
  driverName: string
  total: {
    priceWithVat: number
    priceWOVat: number
  }
  note?: string | null

  constructor(props: any) {
    const p = Item.validationSchema.parse(props)
    this._id = p._id.toString()
    this.orderId = p.orderId.toString()
    this.orderNum = p.orderNum
    this.orderDate = p.orderDate
    this.driverName = p.driverName
    this.total = {
      priceWithVat: p.total.priceWithVat,
      priceWOVat: p.total.priceWOVat,
    }
    this.note = p.note
  }

  static validationSchema = z.object({
    _id: objectIdSchema,
    orderId: objectIdSchema,
    orderNum: z.string().optional().nullable(),
    orderDate: z.string(),
    driverName: z.string(),
    total: z.object({
      priceWithVat: z.number(),
      priceWOVat: z.number(),
    }),
    outsourceTotalPrice: z.object({
      priceWithVat: z.number(),
      priceWOVat: z.number(),
    }),
    note: z.string().nullable().optional(),
  })
}

export class InvoiceOrdersResultDTO {
  totalPriceWithVat: number
  totalPriceWOVat: number
  totalCount: number
  items: Item[]

  constructor(p: any) {
    this.totalCount = p.total[0]?.count ?? 0
    this.totalPriceWithVat = p.total[0]?.totalPriceWithVat ?? 0
    this.totalPriceWOVat = p.total[0]?.totalPriceWOVat ?? 0
    this.items = p.items?.map((i: any) => new Item(i)) ?? []
  }
}
