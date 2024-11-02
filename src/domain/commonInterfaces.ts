import { Types } from 'mongoose'
import z from 'zod'

export const PriceByTypeSchema = z.object({
  note: z.string().optional(),
  type: z.string().optional(),
  priceWOVat: z.number(),
  sumVat: z.number().optional(),
  price: z.number(),
  _id: z.union([z.string(), z.instanceof(Types.ObjectId)]).optional(),
})

export const TotalPriceSchema = z.object({
  price: z.number(),
  priceWOVat: z.number(),
})

export type PriceByType = z.infer<typeof PriceByTypeSchema>
export type TotalPrice = z.infer<typeof TotalPriceSchema>
