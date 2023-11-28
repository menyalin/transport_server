import { Types } from 'mongoose'
import { z } from 'zod'

export class Agreement {
  _id?: string
  name: string
  date: Date
  company: string
  clients: string[]
  isOutsourceAgreement: boolean
  calcWaitingByArrivalDateLoading: boolean = false
  calcWaitingByArrivalDateUnloading: boolean
  noWaitingPaymentForAreLateLoading: boolean
  noWaitingPaymentForAreLateUnloading: boolean
  outsourceCarriers: string[]
  cashPayment: boolean = false
  vatRate: number = 0
  closed: boolean
  useCustomPrices: boolean
  usePriceWithVAT: boolean
  priceRequired: boolean
  clientNumRequired?: boolean = false
  auctionNumRequired?: boolean = false
  note?: string
  commission: number = 0
  executorName: string
  isActive?: boolean = true
  allowedCarriers?: string[] = []

  constructor(data: z.infer<typeof Agreement.validationSchema>) {
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
    this.isOutsourceAgreement = parsedData.isOutsourceAgreement
    this.calcWaitingByArrivalDateLoading =
      parsedData.calcWaitingByArrivalDateLoading
    this.calcWaitingByArrivalDateUnloading =
      parsedData.calcWaitingByArrivalDateUnloading
    this.noWaitingPaymentForAreLateLoading =
      parsedData.noWaitingPaymentForAreLateLoading
    this.noWaitingPaymentForAreLateUnloading =
      parsedData.noWaitingPaymentForAreLateUnloading
    this.outsourceCarriers =
      parsedData.outsourceCarriers &&
      Array.isArray(parsedData.outsourceCarriers)
        ? parsedData.outsourceCarriers
        : []
    this.cashPayment = parsedData.cashPayment || false
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
    this.commission = parsedData.commission || 0
    this.executorName = parsedData.executorName
    this.allowedCarriers = parsedData.allowedCarriers
  }

  private static validationSchema = z.object({
    _id: z.string().optional(),
    name: z.string(),
    isActive: z.boolean().optional(),
    date: z.date(),
    company: z.string(),
    clients: z.array(z.string()).optional(),
    isOutsourceAgreement: z.boolean(),
    calcWaitingByArrivalDateLoading: z.boolean(),
    calcWaitingByArrivalDateUnloading: z.boolean(),
    noWaitingPaymentForAreLateLoading: z.boolean(),
    noWaitingPaymentForAreLateUnloading: z.boolean(),
    outsourceCarriers: z.array(z.string()).optional(),
    cashPayment: z.boolean().optional(),
    vatRate: z.number(),
    closed: z.boolean(),
    useCustomPrices: z.boolean(),
    usePriceWithVAT: z.boolean(),
    priceRequired: z.boolean(),
    clientNumRequired: z.boolean(),
    auctionNumRequired: z.boolean(),
    note: z.string().optional(),
    commission: z.number().optional(),
    executorName: z.string(),
    allowedCarriers: z.array(z.string()).optional(),
  })

  static dbSchema = {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    date: { type: Date, required: true },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    clients: [{ type: Types.ObjectId, ref: 'Partner' }],
    isOutsourceAgreement: { type: Boolean, default: false },
    calcWaitingByArrivalDateLoading: { type: Boolean, default: false },
    calcWaitingByArrivalDateUnloading: { type: Boolean, default: false },
    noWaitingPaymentForAreLateLoading: { type: Boolean, default: false },
    noWaitingPaymentForAreLateUnloading: { type: Boolean, default: false },
    outsourceCarriers: [{ type: Types.ObjectId, ref: 'TkName' }],
    cashPayment: { type: Boolean, default: false },
    vatRate: { type: Number, required: true },
    closed: { type: Boolean, default: false },
    useCustomPrices: { type: Boolean },
    usePriceWithVAT: { type: Boolean, default: false }, // нужно для определения типа (с/без НДС) при выгрузке в excel
    priceRequired: { type: Boolean, default: false },
    clientNumRequired: { type: Boolean, default: false },
    auctionNumRequired: { type: Boolean, default: false },
    note: String,
    commission: { type: Number, default: 0 },
    executorName: { type: String, required: true },
    allowedCarriers: [{ type: Types.ObjectId, ref: 'Company' }],
  }
}
