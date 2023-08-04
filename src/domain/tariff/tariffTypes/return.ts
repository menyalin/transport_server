import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'
import { ITariff } from './tariff.interface'

export interface IReturnTariff extends Omit<ITariff, 'price'> {
  percentOfTariff: number
}

export interface IReturnTariffProps extends Omit<ITariff, 'price'> {
  percentOfTariff: number
}

export class ReturnTariff implements IReturnTariff {
  company: string
  type: TARIFF_TYPES_ENUM
  date: Date
  document?: string
  agreement: string
  truckKind: TRUCK_KINDS_ENUM
  liftCapacity: number
  isActive?: boolean
  note?: string
  percentOfTariff: number

  constructor(t: IReturnTariffProps) {
    if (
      !t.percentOfTariff ||
      isNaN(+t.percentOfTariff) ||
      +t.percentOfTariff < 0
    )
      throw new Error(
        'ReturnTariff constractor error: invalid percentOfTariff value'
      )

    if (t.type !== TARIFF_TYPES_ENUM.return)
      throw new Error('WaitingTariff constractor error: invalid tariff type')
    this.percentOfTariff = t.percentOfTariff
    this.company = t.company
    this.type = t.type
    this.date = t.date
    this.document = t.document
    this.agreement = t.agreement
    this.truckKind = t.truckKind
    this.liftCapacity = t.liftCapacity
    this.note = t.note
  }
}
