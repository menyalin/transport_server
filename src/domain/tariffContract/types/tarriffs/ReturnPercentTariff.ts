import { z } from 'zod'
import { TRUCK_KINDS_ENUM } from '../../../../constants/truck'
import { ICommonTariffFields, IContractDataForTariff } from '../common'
import { Order } from '@/domain/order/order.domain'
import {
  TruckKindsEnumSchema,
  LiftCapacityEnumSchema,
} from '@/shared/validationSchemes'
import { OrderPrice } from '@/domain/order/orderPrice'
import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'

export class ReturnPercentTariff implements ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  percent: number
  withVat?: boolean
  contractName?: string
  contractDate?: Date

  constructor(p: any) {
    const parsedData = ReturnPercentTariff.validationSchema.parse(p)
    this.truckKinds = parsedData.truckKinds
    this.liftCapacities = parsedData.liftCapacities
    this.percent = parsedData.percent
  }
  setContractData(data: IContractDataForTariff) {
    this.withVat = data.withVat
    this.contractName = data.contractName
    this.contractDate = data.contractDate
  }
  getNoteString(): string {
    return `Простой. Контракт: ${this.contractName || '--'} от ${
      this.contractDate?.toLocaleDateString() || '--'
    }`
  }

  private getOrderBasePrice(order: Order): OrderPrice {
    const basePriceCond = (i: OrderPrice): boolean =>
      i.type === ORDER_PRICE_TYPES_ENUM.base
    const price =
      order.finalPrices?.find(basePriceCond) ||
      order.prices?.find(basePriceCond) ||
      order.prePrices?.find(basePriceCond)
    if (!price)
      return new OrderPrice({
        type: ORDER_PRICE_TYPES_ENUM.base,
        price: 0,
        priceWOVat: 0,
        sumVat: 0,
      })
    return price
  }

  canApplyToOrder(order: Order): boolean {
    if (order.reqTransport === undefined) return false
    if (!order.route.hasReturn) return false
    if (!this.truckKinds.includes(order.reqTransport.kind)) return false
    if (!this.liftCapacities.includes(order.reqTransport.liftCapacity))
      return false
    return true
  }

  calculateForOrder(order: Order): OrderPrice[] {
    const basePrice: OrderPrice = this.getOrderBasePrice(order)
    return [
      new OrderPrice({
        type: ORDER_PRICE_TYPES_ENUM.return,
        price: (basePrice?.price ?? 0) * (this.percent / 100),
        priceWOVat: basePrice.priceWOVat * (this.percent / 100),
        sumVat: (basePrice?.sumVat ?? 0) * (this.percent / 100),
      }),
    ]
  }

  static validationSchema = z.object({
    truckKinds: z.array(TruckKindsEnumSchema),
    liftCapacities: z.array(LiftCapacityEnumSchema),
    percent: z.number().min(0),
  })

  static get dbSchema() {
    return {
      truckKinds: [
        {
          type: String,
          enum: TRUCK_KINDS_ENUM,
          required: true,
        },
      ],
      liftCapacities: [{ type: Number, required: true }],
      percent: { type: Number, required: true },
    }
  }
}
