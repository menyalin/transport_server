import { ORDER_PRICE_TYPES_ENUM } from '../../constants/priceTypes'
import { z } from 'zod'

export interface IOrderPriceProps {
  type: ORDER_PRICE_TYPES_ENUM
  priceWOVat: number
  price: number
  sumVat: number
  note?: string
}

export class OrderPrice {
  type: ORDER_PRICE_TYPES_ENUM
  priceWOVat: number
  price: number
  sumVat: number
  note?: string

  constructor(p: IOrderPriceProps) {
    OrderPrice.propsValidationSchema.parse(p)
    this.type = p.type
    this.priceWOVat = p.priceWOVat
    this.price = p.price
    this.sumVat = p.sumVat
    this.note = p.note
  }

  private static propsValidationSchema = z.object({
    type: z.nativeEnum(ORDER_PRICE_TYPES_ENUM),
    priceWOVat: z.number(),
    price: z.number(),
    sumVat: z.number(),
    note: z.string().optional(),
  })

  static dbSchema = {
    type: {
      type: String,
      required: true,
      enum: Object.values(ORDER_PRICE_TYPES_ENUM),
    },
    priceWOVat: { type: Number },
    sumVat: { type: Number },
    price: { type: Number },
    note: String,
  }
}
