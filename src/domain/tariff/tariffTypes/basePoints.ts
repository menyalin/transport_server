import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { ITariffProps, Tariff } from '../tariff.domain'

export interface IBasePointsTariffProps extends ITariffProps {
  type: TARIFF_TYPES_ENUM
  loading: string
  unloading: string
}

export class BasePointsTariff extends Tariff {
  loading: string
  unloading: string
  type: TARIFF_TYPES_ENUM

  constructor(t: IBasePointsTariffProps) {
    if (t.type !== TARIFF_TYPES_ENUM.points)
      throw new Error('BasePointsTariff constractor error: invalid tariff type')
    super(t)
    this.type = t.type
    this.loading = t.loading
    this.unloading = t.unloading
  }
}
