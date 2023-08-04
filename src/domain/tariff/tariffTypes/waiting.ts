import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'
import {
  ITariffPriceDTO,
  TariffPrice,
} from '../../../values/tariff/tariffPrice'
import { ITariff } from './tariff.interface'

export interface IWaitingTariff extends ITariff {
  price: TariffPrice
  orderType: string
  includeHours: number
  roundByHours: number
}

export interface IWaitingTariffProps
  extends Omit<ITariff, 'price'>,
    ITariffPriceDTO {
  includeHours: number
  roundByHours: number
  orderType: string
}

export class WaitingTariff implements IWaitingTariff {
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
  includeHours: number
  roundByHours: number
  orderType: string

  constructor(t: IWaitingTariffProps) {
    if (t.groupVat === undefined && t.withVat === undefined)
      throw new Error(
        'WaitingTariff constractor error: groupVat and withVat args is missing'
      )
    if (t.type !== TARIFF_TYPES_ENUM.waiting)
      throw new Error('WaitingTariff constractor error: invalid tariff type')
    this.company = t.company
    this.type = t.type
    this.date = t.date
    this.document = t.document
    this.agreement = t.agreement
    this.truckKind = t.truckKind
    this.liftCapacity = t.liftCapacity
    this.note = t.note
    this.includeHours = t.includeHours
    this.roundByHours = t.roundByHours
    this.orderType = t.orderType
    this.price = new TariffPrice({
      price: t.price,
      withVat: t.groupVat || t.withVat,
      currency: t.currency || undefined,
    })
  }
}
