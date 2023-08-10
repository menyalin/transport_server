import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'

import { ITariffProps, Tariff } from '../tariff.domain'

export interface IReturnTariffProps extends ITariffProps {
  type: TARIFF_TYPES_ENUM
  percentOfTariff: number
}

export class ReturnTariff extends Tariff {
  type: TARIFF_TYPES_ENUM = TARIFF_TYPES_ENUM.return
  percentOfTariff: number

  constructor(t: IReturnTariffProps) {
    super({ ...t, price: { price: 0, withVat: false } })
    if (
      !t.percentOfTariff ||
      isNaN(+t.percentOfTariff) ||
      +t.percentOfTariff < 0
    )
      throw new Error(
        'ReturnTariff constractor error: invalid percentOfTariff value'
      )

    if (t.type !== this.type)
      throw new Error('WaitingTariff constractor error: invalid tariff type')
    this.percentOfTariff = t.percentOfTariff
  }
}
