import { CURRENCY } from '../../../constants/currency'
import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'
import { TariffPrice } from '../../../values/tariff/tariffPrice'
import { ITariff } from './tariff.interface'

interface IDistanceWithPrice {
  distance: number
  price: number
}

export interface IBaseDirectDistanceZonesTariff extends ITariff {
  zones: IDistanceWithPrice[]
}

export interface IDirectDistanceZonesTariffProps
  extends Omit<ITariff, 'price'> {
  withVat: boolean
  currency?: string
  zones: IDistanceWithPrice[]
}

export class BaseDirectDistanceZonesTariff
  implements IBaseDirectDistanceZonesTariff
{
  company: string
  type: TARIFF_TYPES_ENUM
  date: Date
  agreement: string
  truckKind: TRUCK_KINDS_ENUM
  liftCapacity: number
  note?: string
  document?: string
  isActive?: boolean
  groupVat?: boolean | undefined
  zones: IDistanceWithPrice[]
  currency?: string | undefined
  price: TariffPrice

  constructor(t: IDirectDistanceZonesTariffProps) {
    if (!t.zones || !Array.isArray(t.zones) || t.zones.length === 0)
      throw new Error(
        'BaseDirectDistanceZonesTariff constractor error: zones array is missing'
      )
    if (t.groupVat === undefined && t.withVat === undefined)
      throw new Error(
        'BaseDirectDistanceZonesTariff constractor error: groupVat and withVat args is missing'
      )
    if (t.type !== TARIFF_TYPES_ENUM.directDistanceZones)
      throw new Error(
        'BaseDirectDistanceZonesTariff constractor error: invalid tariff type'
      )
    this.company = t.company
    this.type = t.type
    this.date = t.date
    this.document = t.document
    this.agreement = t.agreement
    this.truckKind = t.truckKind
    this.liftCapacity = t.liftCapacity
    this.note = t.note
    this.zones = t.zones
    this.price = new TariffPrice({
      price: 0,
      withVat: t.withVat,
      currency: t.currency ? t.currency : CURRENCY.rub,
    })
  }
}
