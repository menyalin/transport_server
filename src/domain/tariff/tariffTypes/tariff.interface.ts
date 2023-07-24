import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'
import { TariffPrice } from '../../../values/tariff/tariffPrice'

export interface ITariff {
  company: string
  type: TARIFF_TYPES_ENUM
  date: Date
  document?: string
  agreement: string
  truckKind: TRUCK_KINDS_ENUM
  liftCapacity: number
  note?: string
  isActive?: boolean
  groupVat?: boolean // используется для отображения и должен быть заменен параметром withVat
  price: TariffPrice
}
