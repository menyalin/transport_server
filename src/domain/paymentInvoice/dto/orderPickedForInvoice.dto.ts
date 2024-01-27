import { z } from 'zod'
import { Types } from 'mongoose'
import { ILoaderData, LoaderDataSchema } from '../interfaces'

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

const priceSchema = z.object({
  price: z.number(),
  priceWOVat: z.number(),
})

const orderPickedForInvoiceDTOSchema = z.object({
  _id: z.union([z.string(), z.instanceof(Types.ObjectId)]),
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
  docs: z.array(z.unknown()).optional(),
  docsState: z
    .object({
      getted: z.union([z.boolean(), z.null()]),
      date: z.union([z.instanceof(Date), z.null()]),
    })
    .optional(),

  paymentParts: z.unknown().optional(),
  paymentToDriver: z.unknown(),
  note: z.string().optional(),
  paymentInvoices: z.array(z.unknown()).optional(),
  agreement: z.unknown().optional(),
  total: priceSchema,
  // totalByTypes: z.record(priceSchema),
  totalByTypes: z.unknown(),
  savedTotal: priceSchema.optional(),
  savedTotalByTypes: z.record(priceSchema).optional(),
  driverName: z.string().optional(),
  needUpdate: z.boolean().optional(),
  itemType: z.string().optional(),
  rowId: z.unknown().optional(),
  loaderData: LoaderDataSchema.optional(),
})

export class OrderPickedForInvoiceDTO {
  _id: string
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
  docs?: any[]
  docsState?: {
    getted: boolean | null
    date: Date | null
  }
  paymentParts?: any
  paymentToDriver: any
  note?: string
  paymentInvoices?: any[]
  agreement?: any

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
  loaderData?: ILoaderData

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

    this.agreement = preparedProps.agreement
    this.agreementVatRate = preparedProps.agreementVatRate
    this.totalByTypes = preparedProps.totalByTypes
    this.total = preparedProps.total
    this.savedTotal = preparedProps.savedTotal
    this.savedTotalByTypes = preparedProps.savedTotalByTypes
    this.driverName = preparedProps.driverName
    this.needUpdate = preparedProps.needUpdate
    this.itemType = preparedProps.itemType
    this.rowId = preparedProps.rowId
    if (preparedProps.loaderData) this.loaderData = preparedProps.loaderData
  }

  addLoaderData(registryInformation: ILoaderData[]) {
    const uploadedItem = registryInformation.find(
      (i) => i._id === this._id.toString()
    )
    if (uploadedItem) this.loaderData = uploadedItem
  }

  saveTotal(): void {
    this.savedTotal = this.total
    this.savedTotalByTypes = this.totalByTypes
    this.needUpdate = false
  }
}
