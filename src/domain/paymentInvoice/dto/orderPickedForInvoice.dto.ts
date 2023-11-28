import { z } from 'zod'
import { Types } from 'mongoose'

interface IPrice {
  type: string
  priceWOVat: number
  sumVat: number
  price: number
  _id: Types.ObjectId | string
}
const IPriceSchema = z.object({
  type: z.string(),
  priceWOVat: z.number(),
  sumVat: z.number(),
  price: z.number(),
  _id: z.union([z.string(), z.instanceof(Types.ObjectId)]),
})

const orderPickedForInvoiceDTOSchema = z.object({
  _id: z.union([z.string(), z.instanceof(Types.ObjectId)]),
  docs: z.array(z.unknown()),
  client: z.unknown(),
  company: z.union([z.string(), z.instanceof(Types.ObjectId)]),
  prePrices: z.array(IPriceSchema).optional(),
  prices: z.array(IPriceSchema).optional(),
  finalPrices: z.array(IPriceSchema),
  state: z.unknown(),
  plannedDate: z.instanceof(Date),
  orderId: z.union([z.string(), z.instanceof(Types.ObjectId)]),
  isSelectable: z.boolean().optional(),
  agreementVatRate: z.number(),
  paymentPartsSumWOVat: z.number(),
  reqTransport: z.unknown(),
  confirmedCrew: z.object({
    truck: z.union([z.string(), z.instanceof(Types.ObjectId)]),
    trailer: z.union([z.string(), z.instanceof(Types.ObjectId), z.null()]),
    driver: z.union([z.string(), z.instanceof(Types.ObjectId), z.null()]),
    outsourceAgreement: z.union([
      z.string(),
      z.instanceof(Types.ObjectId),
      z.null(),
    ]),
    tkName: z.union([z.string(), z.instanceof(Types.ObjectId)]),
  }),
  route: z.array(z.unknown()),
  analytics: z.object({
    type: z.string(),
    distanceRoad: z.number(),
    distanceDirect: z.number(),
  }),
  docsState: z.object({
    getted: z.union([z.boolean(), z.null()]),
    date: z.union([z.instanceof(Date), z.null()]),
  }),

  paymentParts: z.unknown().optional(),
  paymentToDriver: z.unknown(),
  note: z.string().optional(),
  paymentInvoices: z.array(z.unknown()).optional(),
  _agreement: z.unknown(),
  totalByTypes: z.unknown(),
  total: z.object({
    price: z.number(),
    priceWOVat: z.number(),
  }),
  savedTotal: z
    .object({
      price: z.number(),
      priceWOVat: z.number(),
    })
    .optional(),
  savedTotalByTypes: z.unknown(),
  driverName: z.string().optional(),
  needUpdate: z.boolean().optional(),
  itemType: z.string().optional(),
  rowId: z.unknown().optional(),
})

export class OrderPickedForInvoiceDTO {
  _id: string
  docs: any[]
  client: any
  company: Types.ObjectId | string
  prePrices?: IPrice[]
  prices?: IPrice[]
  state: any
  finalPrices?: IPrice[]
  plannedDate: Date
  orderId: Types.ObjectId | string
  isSelectable?: boolean = false
  agreementVatRate: number
  paymentPartsSumWOVat: number
  driverName?: string
  reqTransport: any
  confirmedCrew: {
    truck: Types.ObjectId | string
    trailer: Types.ObjectId | string | null
    driver: Types.ObjectId | string | null
    outsourceAgreement: Types.ObjectId | string | null
    tkName: Types.ObjectId | string
  }
  route: any[]
  analytics: {
    type: string
    distanceRoad: number
    distanceDirect: number
  }
  docsState: {
    getted: boolean | null
    date: Date | null
  }
  paymentParts?: any
  paymentToDriver: any
  note?: string
  paymentInvoices?: any[]
  _agreement: any
  totalByTypes: any
  total: {
    price: number
    priceWOVat: number
  }
  savedTotalByTypes?: any
  savedTotal?: {
    price: number
    priceWOVat: number
  }
  needUpdate?: boolean
  itemType?: string
  rowId?: any

  constructor(props: any) {
    const preparedProps = orderPickedForInvoiceDTOSchema.parse(props)

    this._id = preparedProps._id.toString()
    this.docs = preparedProps.docs
    this.client = preparedProps.client
    this.company = preparedProps.company
    this.state = preparedProps.state
    this.prePrices = preparedProps.prePrices
    this.prices = preparedProps.prices
    this.finalPrices = preparedProps.finalPrices
    this.plannedDate = preparedProps.plannedDate
    this.orderId = preparedProps.orderId
    this.isSelectable = preparedProps.isSelectable
    this.paymentPartsSumWOVat = preparedProps.paymentPartsSumWOVat
    this.confirmedCrew = preparedProps.confirmedCrew
    this.reqTransport = preparedProps.reqTransport
    this.route = preparedProps.route
    this.analytics = preparedProps.analytics
    this.docsState = preparedProps.docsState
    this.paymentParts = preparedProps.paymentParts
    this.paymentToDriver = preparedProps.paymentToDriver
    this.note = preparedProps.note
    this.paymentInvoices = preparedProps.paymentInvoices
    this._agreement = preparedProps._agreement
    this.agreementVatRate = preparedProps.agreementVatRate
    this.totalByTypes = preparedProps.totalByTypes
    this.total = preparedProps.total
    this.savedTotal = preparedProps.savedTotal
    this.savedTotalByTypes = preparedProps.savedTotalByTypes
    this.driverName = preparedProps.driverName
    this.needUpdate = preparedProps.needUpdate
    this.itemType = preparedProps.itemType
    this.rowId = preparedProps.rowId
  }

  saveTotal(): void {
    this.savedTotal = this.total
    this.savedTotalByTypes = this.totalByTypes
    this.needUpdate = false
  }
}
