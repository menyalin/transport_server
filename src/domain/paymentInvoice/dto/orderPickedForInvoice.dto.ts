import { ObjectExpression, Types } from 'mongoose'
import {
  ILoaderData,
  OrderPickedForInvoiceDTOProps,
  PriceByType,
  TotalPrice,
  orderPickedForInvoiceDTOSchema,
} from '../interfaces'
import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'
import { utils } from './utils'

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
  note?: string
  paymentInvoices?: any[]
  agreement?: any
  _loadingZones?: object[]
  totalByTypes: Record<ORDER_PRICE_TYPES_ENUM, PriceByType>
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
    this.paymentPartsSumWOVat = preparedProps.paymentPartsSumWOVat
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
    this.driverName = preparedProps.driverName
    this.itemType = preparedProps.itemType
    this.rowId = preparedProps.rowId
    this._loadingZones = preparedProps._loadingZones
    this.savedTotal = preparedProps.savedTotal
    this.savedTotalByTypes = preparedProps.savedTotalByTypes
    this.totalByTypes = utils.calcTotalByTypes(preparedProps)
    this.total = utils.calcTotal(this.totalByTypes)
    this.needUpdate = utils.isNeedUpdatePrices(this.total, this.savedTotal)
    this.note = preparedProps.paymentParts
      ? preparedProps.paymentParts.note
      : preparedProps.note
    if (preparedProps.loaderData) this.loaderData = preparedProps.loaderData

    if (
      preparedProps._total &&
      preparedProps._totalWOVat &&
      (preparedProps._total.toFixed(2) !== this.total.price.toFixed(2) ||
        preparedProps._totalWOVat.toFixed(2) !==
          this.total.priceWOVat.toFixed(2))
    ) {
      console.log('Ошибка запроса. не корректный расчет итогов по рейсу')
    }
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
