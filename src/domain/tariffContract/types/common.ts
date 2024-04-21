import { TRUCK_KINDS_ENUM } from '../../../constants/truck'

export type TariffBy = 'hour' | 'day'
export type RoundByHours = 0.01666666 | 0.5 | 1 | 12 | 24

export interface ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
}
