import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'
import {
  ITariffPriceDTO,
  TariffPrice,
} from '../../../values/tariff/tariffPrice'
import { ITariff } from './tariff.interface'

export interface IBasePointsTariff extends ITariff {
  loading: string
  unloading: string
}

export interface IBasePointsTariffProps
  extends Omit<ITariff, 'price'>,
    ITariffPriceDTO {
  loading: string
  unloading: string
}

export class BasePointsTariff implements IBasePointsTariff {
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
  loading: string
  unloading: string

  constructor(t: IBasePointsTariffProps) {
    if (t.groupVat === undefined && t.withVat === undefined)
      throw new Error(
        'BasePointsTariff constractor error: groupVat and withVat args is missing'
      )
    if (t.type !== TARIFF_TYPES_ENUM.points)
      throw new Error('BasePointsTariff constractor error: invalid tariff type')
    this.company = t.company
    this.type = t.type
    this.date = t.date
    this.document = t.document
    this.agreement = t.agreement
    this.truckKind = t.truckKind
    this.liftCapacity = t.liftCapacity
    this.note = t.note
    this.loading = t.loading
    this.unloading = t.unloading
    this.price = new TariffPrice({
      price: t.price,
      withVat: t.groupVat || t.withVat,
      currency: t.currency || undefined,
    })
  }
}
