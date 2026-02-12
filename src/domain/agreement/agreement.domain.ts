import { objectIdSchema } from '@/shared/validationSchemes'
import { Types } from 'mongoose'
import { z } from 'zod'

export class Agreement {
  _id?: string
  name: string
  date?: Date
  endDate: Date | null
  company: string
  clients: string[]
  // isOutsourceAgreement: boolean
  calcWaitingByArrivalDateLoading: boolean = false
  calcWaitingByArrivalDateUnloading: boolean = false
  noWaitingPaymentForAreLateLoading: boolean = false
  noWaitingPaymentForAreLateUnloading: boolean = false
  // outsourceCarriers: string[]
  // cashPayment: boolean = false
  vatRate?: number = 0
  closed: boolean = false
  useCustomPrices: boolean
  usePriceWithVAT: boolean
  priceRequired: boolean
  clientNumRequired?: boolean = false
  auctionNumRequired?: boolean = false
  note?: string | null
  // paymentDescription?: string | null
  // commission: number = 0
  executor?: string | null
  executorName: string | null
  isActive?: boolean = true
  allowedCarriers?: string[] = []
  actBasis?: string
  actDescription?: string

  constructor(data: unknown) {
    const parsedData = Agreement.validationSchema.parse(data)
    this._id = parsedData._id
    this.name = parsedData.name
    this.isActive =
      parsedData.isActive === undefined ? true : parsedData.isActive
    this.date = parsedData.date
    this.endDate = parsedData.endDate
    this.company = parsedData.company
    this.clients =
      parsedData.clients && Array.isArray(parsedData.clients)
        ? parsedData.clients
        : []
    // this.isOutsourceAgreement = parsedData.isOutsourceAgreement
    this.calcWaitingByArrivalDateLoading =
      parsedData.calcWaitingByArrivalDateLoading
    this.calcWaitingByArrivalDateUnloading =
      parsedData.calcWaitingByArrivalDateUnloading
    this.noWaitingPaymentForAreLateLoading =
      parsedData.noWaitingPaymentForAreLateLoading
    this.noWaitingPaymentForAreLateUnloading =
      parsedData.noWaitingPaymentForAreLateUnloading
    // this.outsourceCarriers =
    //   parsedData.outsourceCarriers &&
    //   Array.isArray(parsedData.outsourceCarriers)
    //     ? parsedData.outsourceCarriers
    //     : []
    // this.cashPayment = parsedData.cashPayment || false
    this.vatRate = parsedData.vatRate ?? undefined
    this.closed = parsedData.closed || false
    this.useCustomPrices = parsedData.useCustomPrices || false
    this.usePriceWithVAT =
      parsedData.usePriceWithVAT === undefined
        ? false
        : parsedData.usePriceWithVAT
    this.priceRequired = parsedData.priceRequired
    this.clientNumRequired = parsedData.clientNumRequired
    this.auctionNumRequired = parsedData.auctionNumRequired
    this.note = parsedData.note
    // this.commission = parsedData.commission || 0
    this.executor = parsedData.executor?.toString() ?? null
    this.executorName = parsedData.executorName || null
    this.allowedCarriers = parsedData.allowedCarriers
    this.actBasis = parsedData.actBasis || ''
    this.actDescription = parsedData.actDescription || ''

    // this.paymentDescription = parsedData.paymentDescription
  }

  private static validationSchema = z.object({
    _id: objectIdSchema
      .optional()
      .transform((val) => (val ? val.toString() : undefined)),
    name: z.string(),
    isActive: z.boolean().optional(),
    date: z.union([z.date(), z.string()]).transform((v) => new Date(v)),
    endDate: z
      .union([z.date(), z.string()])
      .optional()
      .nullable()
      .transform((v) => (v ? new Date(v) : null)),
    company: objectIdSchema.transform((val) => val.toString()),
    clients: z
      .array(objectIdSchema)
      .optional()
      .transform((val) => {
        if (!val) return undefined
        return val.map((i) => i.toString())
      }),
    // isOutsourceAgreement: z.boolean(),
    calcWaitingByArrivalDateLoading: z
      .boolean()
      .optional()
      .transform((val) => Boolean(val)),
    calcWaitingByArrivalDateUnloading: z
      .boolean()
      .optional()
      .transform((val) => Boolean(val)),
    noWaitingPaymentForAreLateLoading: z
      .boolean()
      .optional()
      .transform((val) => Boolean(val)),
    noWaitingPaymentForAreLateUnloading: z
      .boolean()
      .optional()
      .transform((val) => Boolean(val)),

    vatRate: z.number().optional().nullable(),

    closed: z
      .boolean()
      .nullable()
      .transform((val) => Boolean(val)),
    useCustomPrices: z
      .boolean()
      .optional()
      .transform((val) => Boolean(val)),
    usePriceWithVAT: z
      .boolean()
      .optional()
      .transform((val) => Boolean(val)),
    priceRequired: z
      .boolean()
      .optional()
      .transform((val) => Boolean(val)),
    clientNumRequired: z
      .boolean()
      .optional()
      .transform((val) => Boolean(val)),
    auctionNumRequired: z
      .boolean()
      .optional()
      .transform((val) => Boolean(val)),
    note: z.string().nullable().optional(),
    actBasis: z.string().nullable().optional(),
    actDescription: z.string().nullable().optional(),
    executor: objectIdSchema.nullable().optional(),
    executorName: z.string().nullable().optional(),
    allowedCarriers: z
      .array(objectIdSchema)
      .optional()
      .transform((val) => {
        if (!val) return undefined
        return val.map((i) => i.toString())
      }),
  })

  static dbSchema = {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    date: { type: Date, required: true },
    endDate: Date,
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    clients: [{ type: Types.ObjectId, ref: 'Partner' }],
    calcWaitingByArrivalDateLoading: { type: Boolean, default: false },
    calcWaitingByArrivalDateUnloading: { type: Boolean, default: false },
    noWaitingPaymentForAreLateLoading: { type: Boolean, default: false },
    noWaitingPaymentForAreLateUnloading: { type: Boolean, default: false },
    cashPayment: { type: Boolean, default: false },
    vatRate: { type: Number, default: 0 },
    closed: { type: Boolean, default: false },
    useCustomPrices: { type: Boolean },
    usePriceWithVAT: { type: Boolean, default: false }, // нужно для определения типа (с/без НДС) при выгрузке в excel
    priceRequired: { type: Boolean, default: false },
    clientNumRequired: { type: Boolean, default: false },
    auctionNumRequired: { type: Boolean, default: false },
    note: String,
    executor: { type: Types.ObjectId, ref: 'TkName' },
    executorName: { type: String },
    allowedCarriers: [{ type: Types.ObjectId, ref: 'Company' }],
    actBasis: String,
    actDescription: String,
  }
}
