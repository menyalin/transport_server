import { Types } from 'mongoose'
import z from 'zod'

export const OrderPaymentPartPropsSchema = z.object({
  client: z.union([z.string(), z.instanceof(Types.ObjectId)]),
  agreement: z.union([z.string(), z.instanceof(Types.ObjectId)]),
  type: z.string().optional(),
  priceWOVat: z.number(),
  sumVat: z.number().optional(),
  price: z.number().optional(),
  _id: z.union([z.string(), z.instanceof(Types.ObjectId)]).optional(),
  note: z.string().optional(),
})

export class OrderPaymentPart {
  static get dbSchema() {
    return {
      client: { type: Types.ObjectId, ref: 'Partner', required: true },
      agreement: { type: Types.ObjectId, ref: 'Agreement', required: true },
      type: { type: String, default: 'part' },
      priceWOVat: { type: Number, required: true },
      price: Number,
      sumVat: Number,
      note: String,
    }
  }
}
