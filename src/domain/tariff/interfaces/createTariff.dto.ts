import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import {
  TRUCK_KINDS_ENUM,
  TRUCK_LIFT_CAPACITY_TYPES,
} from '../../../constants/truck'

export interface ICreateTariffDTO {
  type: TARIFF_TYPES_ENUM
  date: Date
  company: string
  truckKind: TRUCK_KINDS_ENUM
  liftCapacity: number[]
}
