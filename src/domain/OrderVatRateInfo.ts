import { z } from 'zod'

export class OrderVatRateInfo {
  date: Date
  vatRate: number
  usePriceWithVat: boolean

  constructor(p: unknown) {
    const parsed = OrderVatRateInfo.validationSchema.parse(p)
    this.date = parsed.date
    this.vatRate = parsed.vatRate
    this.usePriceWithVat = parsed.usePriceWithVat
  }

  static get validationSchema() {
    return z.object({
      date: z.union([z.date(), z.string()]).transform((v) => new Date(v)),
      vatRate: z.number(),
      usePriceWithVat: z.boolean(),
    })
  }

  static get dbSchema() {
    return {
      date: { type: Date },
      vatRate: { type: Number },
      usePriceWithVat: { type: Boolean },
    }
  }
}
