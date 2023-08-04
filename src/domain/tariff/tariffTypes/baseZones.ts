import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'
import {
  ITariffPriceDTO,
  TariffPrice,
} from '../../../values/tariff/tariffPrice'
import { ITariff } from './tariff.interface'

export interface IBaseZonesTariff extends ITariff {
  price: TariffPrice
  loadingZone: string
  unloadingZone: string
}

export interface IBaseZonesTariffProps
  extends Omit<ITariff, 'price'>,
    ITariffPriceDTO {
  loadingZone: string
  unloadingZone: string
}

export class BaseZonesTariff implements IBaseZonesTariff {
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
  loadingZone: string
  unloadingZone: string
  groupVat?: boolean | undefined

  constructor(t: IBaseZonesTariffProps) {
    if (!t.loadingZone || !t.unloadingZone)
      throw new Error(
        'BaseZonesTariff constractor error: loadingZone or unloadingZone is missing'
      )
    if (t.groupVat === undefined && t.withVat === undefined)
      throw new Error(
        'BaseZonesTariff constractor error: groupVat and withVat args is missing'
      )
    if (t.type !== TARIFF_TYPES_ENUM.zones)
      throw new Error('BaseZonesTariff constractor error: invalid tariff type')
    this.company = t.company
    this.type = t.type
    this.date = t.date
    this.document = t.document
    this.agreement = t.agreement
    this.truckKind = t.truckKind
    this.liftCapacity = t.liftCapacity
    this.note = t.note
    this.loadingZone = t.loadingZone
    this.unloadingZone = t.unloadingZone
    this.price = new TariffPrice({
      price: t.price,
      withVat: t.groupVat || t.withVat,
      currency: t.currency || undefined,
    })
  }
}
