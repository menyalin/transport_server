import { objectIdSchema } from '@/shared/validationSchemes'
import { Types } from 'mongoose'
import { z } from 'zod'

export class Agreement {
  _id?: string
  name: string
  date?: Date
  company: string
  clients: string[]
  // isOutsourceAgreement: boolean
  calcWaitingByArrivalDateLoading: boolean = false
  calcWaitingByArrivalDateUnloading: boolean = false
  noWaitingPaymentForAreLateLoading: boolean = false
  noWaitingPaymentForAreLateUnloading: boolean = false
  // outsourceCarriers: string[]
  // cashPayment: boolean = false
  vatRate: number = 0
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

  constructor(data: unknown) {
    const parsedData = Agreement.validationSchema.parse(data)
    this._id = parsedData._id
    this.name = parsedData.name
    this.isActive =
      parsedData.isActive === undefined ? true : parsedData.isActive
    this.date = parsedData.date
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
    this.vatRate = parsedData.vatRate || 0
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

    // this.paymentDescription = parsedData.paymentDescription
  }

  private static validationSchema = z.object({
    _id: objectIdSchema
      .optional()
      .transform((val) => (val ? val.toString() : undefined)),
    name: z.string(),
    isActive: z.boolean().optional(),
    date: z.date(),
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
    // outsourceCarriers: z
    //   .array(objectIdSchema)
    //   .optional()
    //   .transform((val) => {
    //     if (!val) return undefined
    //     return val.map((i) => i.toString())
    //   }),
    // cashPayment: z.boolean().optional(),
    vatRate: z.number(),
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
    // commission: z
    //   .number()
    //   .nullable()
    //   .optional()
    //   .transform((val) => (val ? val : 0)),
    executor: objectIdSchema.nullable().optional(),
    executorName: z.string().nullable().optional(),
    allowedCarriers: z
      .array(objectIdSchema)
      .optional()
      .transform((val) => {
        if (!val) return undefined
        return val.map((i) => i.toString())
      }),
    // paymentDescription: z.string().nullable().optional(),
  })

  static dbSchema = {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    date: { type: Date, required: true },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    clients: [{ type: Types.ObjectId, ref: 'Partner' }],
    // isOutsourceAgreement: { type: Boolean, default: false },
    calcWaitingByArrivalDateLoading: { type: Boolean, default: false },
    calcWaitingByArrivalDateUnloading: { type: Boolean, default: false },
    noWaitingPaymentForAreLateLoading: { type: Boolean, default: false },
    noWaitingPaymentForAreLateUnloading: { type: Boolean, default: false },
    // outsourceCarriers: [{ type: Types.ObjectId, ref: 'TkName' }],
    cashPayment: { type: Boolean, default: false },
    vatRate: { type: Number, required: true },
    closed: { type: Boolean, default: false },
    useCustomPrices: { type: Boolean },
    usePriceWithVAT: { type: Boolean, default: false }, // нужно для определения типа (с/без НДС) при выгрузке в excel
    priceRequired: { type: Boolean, default: false },
    clientNumRequired: { type: Boolean, default: false },
    auctionNumRequired: { type: Boolean, default: false },
    note: String,
    // commission: { type: Number, default: 0 },
    executor: { type: Types.ObjectId, ref: 'TkName' },
    executorName: { type: String },
    allowedCarriers: [{ type: Types.ObjectId, ref: 'Company' }],
    // paymentDescription: { type: String },
  }
}
