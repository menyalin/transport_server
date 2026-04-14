import { objectIdSchema } from '@/shared/validationSchemes'
import dayjs from 'dayjs'
import { Types } from 'mongoose'
import z from 'zod'

export class TransportWaybill {
  _id: string
  company: string
  number: string
  shipperAddressId: string
  consigneeAddressId: string
  date: Date
  docsDescription: string
  orderId: string
  note: string

  constructor(props: unknown) {
    const p = TransportWaybill.validationSchema.parse(props)
    this._id = p._id
    this.number = p.number
    this.company = p.company
    this.shipperAddressId = p.shipperAddressId
    this.consigneeAddressId = p.consigneeAddressId
    this.docsDescription = p.docsDescription
    this.date = p.date
    this.orderId = p.orderId
    this.note = p.note
  }

  static get validationSchema() {
    return z.object({
      _id: objectIdSchema.transform((v) => v.toString()),
      company: objectIdSchema.transform((v) => v.toString()),
      number: z.string(),
      shipperAddressId: objectIdSchema.transform((v) => v.toString()),
      consigneeAddressId: objectIdSchema.transform((v) => v.toString()),
      docsDescription: z.string().default(''),
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
      company: Types.ObjectId,
      shipperAddressId: Types.ObjectId,
      consigneeAddressId: Types.ObjectId,
      docsDescription: String,
      date: Date,
      orderId: String,
      note: String,
    }
  }
}
