import { objectIdSchema } from '@/shared/validationSchemes'
import { Types } from 'mongoose'
import { z } from 'zod'

export class CarrierAgreement {
  _id: string
  name: string
  company: string
  isActive: boolean
  paymentDescription: string
  paymentOfDays: number = 0
  orderContractNote: string
  vatRate: number
  note: string

  constructor(props: unknown) {
    const p = CarrierAgreement.validationSchema.parse(props)
    this._id = p._id.toString()
    this.name = p.name
    this.company = p.company.toString()
    this.isActive = p.isActive
    this.paymentDescription = p.paymentDescription
    this.orderContractNote = p.orderContractNote
    this.paymentOfDays = p.paymentOfDays
    this.vatRate = p.vatRate
    this.note = p.note
  }

  update(body: unknown) {
    const p = CarrierAgreement.validationSchema.parse(body)
    this.name = p.name
    this.isActive = p.isActive
    this.paymentOfDays = p.paymentOfDays
    this.paymentDescription = p.paymentDescription
    this.orderContractNote = p.orderContractNote
    this.vatRate = p.vatRate
    this.note = p.note
  }

  static get validationSchema() {
    return z.object({
      _id: objectIdSchema,
      name: z.string(),
      company: objectIdSchema,
      isActive: z.boolean().default(true),
      paymentDescription: z
        .string()
        .nullable()
        .optional()
        .transform((v) => String(v)),
      orderContractNote: z
        .string()
        .optional()
        .nullable()
        .transform((v) => String(v)),
      vatRate: z.number().default(0),
      paymentOfDays: z
        .number()
        .nullable()
        .default(0)
        .transform((v) => Number(v)),
      note: z
        .string()
        .optional()
        .nullable()
        .transform((v) => String(v)),
    })
  }

  static get dbSchema() {
    return {
      name: String,
      company: { type: Types.ObjectId, ref: 'Company' },
      isActive: { type: Boolean, default: true },
      paymentDescription: String,
      orderContractNote: String,
      vatRate: Number,
      paymentOfDays: Number,
      note: String,
    }
  }
}
