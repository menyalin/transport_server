import { TARIFF_TYPES_ENUM, WAITING_TARIFF_BY } from '../../../constants/tariff'
import { ITariffProps, Tariff } from '../tariff.domain'

export interface IWaitingTariffProps extends ITariffProps {
  type: TARIFF_TYPES_ENUM
  includeHours: number
  roundByHours: number
  orderType: string
  tariffBy: WAITING_TARIFF_BY
}

export class WaitingTariff extends Tariff {
  type: TARIFF_TYPES_ENUM = TARIFF_TYPES_ENUM.waiting
  orderType: string
  includeHours: number
  roundByHours: number
  tariffBy: WAITING_TARIFF_BY

  constructor(t: IWaitingTariffProps) {
    super(t)
    if (t.type !== this.type)
      throw new Error('WaitingTariff constractor error: invalid tariff type')
    if (
      t.includeHours === undefined ||
      t.roundByHours === undefined ||
      t.orderType === undefined ||
      t.tariffBy === undefined
    )
      throw new Error(
        'WaitingTariff constractor error: reqired props is missing'
      )
    this.includeHours = t.includeHours
    this.roundByHours = t.roundByHours
    this.orderType = t.orderType
    this.tariffBy = t.tariffBy
  }
}
