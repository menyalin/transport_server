import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { ITariffProps, Tariff } from '../tariff.domain'

interface IDistanceWithPrice {
  distance: number
  price: number
}

export interface IDirectDistanceZonesTariffProps extends ITariffProps {
  type: TARIFF_TYPES_ENUM
  zones: IDistanceWithPrice[]
}

export class BaseDirectDistanceZonesTariff extends Tariff {
  type: TARIFF_TYPES_ENUM = TARIFF_TYPES_ENUM.directDistanceZones
  zones: IDistanceWithPrice[]

  constructor(t: IDirectDistanceZonesTariffProps) {
    super(t)
    if (!t.zones || !Array.isArray(t.zones) || t.zones.length === 0)
      throw new Error(
        'BaseDirectDistanceZonesTariff constractor error: zones array is missing'
      )

    if (t.type !== this.type)
      throw new Error(
        'BaseDirectDistanceZonesTariff constractor error: invalid tariff type'
      )

    this.zones = t.zones
  }
}
