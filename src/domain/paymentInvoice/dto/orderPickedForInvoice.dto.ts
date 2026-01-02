import { Types } from 'mongoose'
import {
  ILoaderData,
  OrderPickedForInvoiceDTOProps,
  orderPickedForInvoiceDTOSchema,
} from '../interfaces'

import { utils } from './utils'
import { PriceByType, TotalPrice } from '@/domain/commonInterfaces'

export class OrderPickedForInvoiceDTO {
  _id: string
  client: any
  company: Types.ObjectId | string
  prePrices?: PriceByType[]
  prices?: PriceByType[]
  state: any
  finalPrices?: PriceByType[]
  plannedDate: Date
  orderId: Types.ObjectId | string
  isSelectable?: boolean = false
  agreementVatRate: number
  usePriceWithVat: boolean
  paymentPartsSum: number
  driverName?: string
  reqTransport: any
  confirmedCrew: {
    truck?: Types.ObjectId | string | null
    trailer?: Types.ObjectId | string | null
    driver?: Types.ObjectId | string | null
    outsourceAgreement?: Types.ObjectId | string | null
    tkName?: Types.ObjectId | string | null
  }
  route: any[]
  analytics?: {
    type: string
    distanceRoad: number
    distanceDirect: number
  }
  docs?: any[]
  docNumbers?: string
  docsState?: {
    getted?: boolean | null
    date?: Date | null
  }
  paymentParts?: any
  paymentToDriver: any
  note?: string | null
  paymentInvoices?: any[]
  agreement?: any
  _loadingZones?: object[]
  totalByTypes: Record<string, PriceByType>
  total: TotalPrice
  savedTotalByTypes?: any
  savedTotal?: TotalPrice
  needUpdate?: boolean
  itemType?: string
  rowId?: any
  loaderData?: ILoaderData

  constructor(props: OrderPickedForInvoiceDTOProps) {
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
    this.paymentPartsSum = preparedProps.paymentPartsSum
    this.confirmedCrew = preparedProps.confirmedCrew
    this.reqTransport = preparedProps.reqTransport
    this.route = preparedProps.route
    this.analytics = preparedProps.analytics
    this.docsState = preparedProps?.docsState
    this.docNumbers = preparedProps?.docNumbers
    this.paymentParts = preparedProps.paymentParts
    this.paymentToDriver = preparedProps.paymentToDriver
    this.paymentInvoices = preparedProps.paymentInvoices
    this.agreement = preparedProps.agreement
    this.agreementVatRate = preparedProps.agreementVatRate
    this.usePriceWithVat = preparedProps.usePriceWithVat
    this.driverName = preparedProps.driverName
    this.itemType = preparedProps.itemType
    this.rowId = preparedProps.rowId
    this._loadingZones = preparedProps._loadingZones
    this.savedTotal = preparedProps.savedTotal
    this.savedTotalByTypes = preparedProps.savedTotalByTypes
    this.totalByTypes = preparedProps.totalByTypes
    this.total = preparedProps.total

    this.needUpdate = utils.isNeedUpdatePrices(this.total, this.savedTotal)
    this.note = preparedProps.paymentParts
      ? preparedProps.paymentParts.note
      : preparedProps.note
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
    this.needUpdate = false
  }
}
