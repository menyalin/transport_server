import { Order } from '@/domain/order/order.domain'
import { TRUCK_KINDS_ENUM } from '@/constants/truck'
import { Agreement } from '@/domain/agreement/agreement.domain'
import { OrderPrice } from '@/domain/order/orderPrice'

export type TariffBy = 'hour' | 'day'
export type RoundByHours = 0.01666666 | 0.5 | 1 | 12 | 24

export interface IContractDataForTariff {
  withVat: boolean
  contractName: string
  contractDate: Date
}

export interface ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  withVat?: boolean

  canApplyToOrder: (order: Order) => boolean

  setContractData: (data: IContractDataForTariff) => void
  getNoteString: () => string

  calculateForOrder: (order: Order, agreement: Agreement) => OrderPrice[]
}
