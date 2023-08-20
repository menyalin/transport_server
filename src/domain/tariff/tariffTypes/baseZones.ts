import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { ITariffProps, Tariff } from '../tariff.domain'

export interface IBaseZonesTariffProps extends ITariffProps {
  type: TARIFF_TYPES_ENUM
  loadingZone: string
  unloadingZone: string
}

export class BaseZonesTariff extends Tariff {
  type: TARIFF_TYPES_ENUM = TARIFF_TYPES_ENUM.zones
  loadingZone: string
  unloadingZone: string

  constructor(t: IBaseZonesTariffProps) {
    super(t)
    if (!t.loadingZone || !t.unloadingZone)
      throw new Error(
        'BaseZonesTariff constractor error: loadingZone or unloadingZone is missing'
      )
    if (t.type !== this.type)
      throw new Error('BaseZonesTariff constractor error: invalid tariff type')
    this.loadingZone = t.loadingZone
    this.unloadingZone = t.unloadingZone
  }
}
