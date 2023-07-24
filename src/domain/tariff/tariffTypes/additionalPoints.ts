import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'
import {
  ITariffPriceDTO,
  TariffPrice,
} from '../../../values/tariff/tariffPrice'
import { ITariff } from './tariff.interface'

export interface IAdditionalPointsTariff extends ITariff {
  orderType: string
  includedPoints: number
}

export interface IAdditionalPointsTariffProps
  extends Omit<ITariff, 'price'>,
    ITariffPriceDTO {
  orderType: string
  includedPoints: number
}

export class AdditionalPointsTariff implements IAdditionalPointsTariff {
  company: string
  type: TARIFF_TYPES_ENUM
  date: Date
  agreement: string
  truckKind: TRUCK_KINDS_ENUM
  liftCapacity: number
  note?: string
  price: TariffPrice
  document?: string
  isActive?: boolean
  includedPoints: number
  orderType: string

  constructor(t: IAdditionalPointsTariffProps) {
    if (t.groupVat === undefined && t.withVat === undefined)
      throw new Error(
        'AdditionalPointsTariff constractor error: groupVat and withVat args is missing'
      )
    if (t.type !== TARIFF_TYPES_ENUM.waiting)
      throw new Error(
        'AdditionalPointsTariff constractor error: invalid tariff type'
      )
    if (t.includedPoints === undefined || t.includedPoints === null)
      throw new Error(
        'AdditionalPointsTariff constractor error: includedPoints is missing'
      )
    this.company = t.company
    this.type = t.type
    this.date = t.date
    this.document = t.document
    this.agreement = t.agreement
    this.truckKind = t.truckKind
    this.liftCapacity = t.liftCapacity
    this.note = t.note
    this.includedPoints = t.includedPoints
    this.orderType = t.orderType
    this.price = new TariffPrice({
      price: t.price,
      withVat: t.groupVat || t.withVat,
      currency: t.currency || undefined,
    })
  }
}
