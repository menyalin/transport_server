import { objectIdSchema } from '@/shared/validationSchemes'
import { Types } from 'mongoose'
import { z } from 'zod'

export class CarrierAgreement {
  _id: string
  name: string
  company: string
  isActive: boolean
  usePriceWithVAT: boolean
  paymentDescription: string
  paymentOfDays: number = 0
  customer?: string
  actBasis: string
  actDescription: string
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
    this.customer = p.customer ? p.customer.toString() : undefined
    this.actBasis = p.actBasis ?? ''
    this.actDescription = p.actDescription ?? ''
    this.vatRate = p.vatRate
    this.usePriceWithVAT = p.vatRate > 0 ? p.usePriceWithVAT : false
    this.note = p.note
  }

  update(body: unknown) {
    const p = CarrierAgreement.validationSchema.parse(body)
    this.name = p.name
    this.isActive = p.isActive
    this.customer = p.customer?.toString() ?? undefined
    this.actBasis = p.actBasis ?? ''
    this.actDescription = p.actDescription ?? ''
    this.paymentOfDays = p.paymentOfDays
    this.paymentDescription = p.paymentDescription
    this.orderContractNote = p.orderContractNote
    this.usePriceWithVAT = p.usePriceWithVAT
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
      usePriceWithVAT: z
        .boolean()
        .nullable()
        .optional()
        .default(false)
        .transform((v) => Boolean(v)),
      paymentOfDays: z
        .number()
        .nullable()
        .default(0)
        .transform((v) => Number(v)),
      actBasis: z.string().optional().nullable(),
      actDescription: z.string().optional().nullable(),
      customer: objectIdSchema.optional().nullable(),
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
      customer: { type: Types.ObjectId, ref: 'TkName' },
      actBasis: String,
      actDescription: String,
      vatRate: Number,
      usePriceWithVAT: { type: Boolean, default: false },
      paymentOfDays: Number,
      note: String,
    }
  }
}
