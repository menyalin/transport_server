import { z } from 'zod'
import { TRUCK_KINDS_ENUM } from '@/constants/truck'
import { ICommonTariffFields } from '../common'
import {
  LiftCapacityEnumSchema,
  PriceSchema,
  TruckKindsEnumSchema,
} from '../validationSchemes'
import { OrderType, OrderTypeSchema } from '@/domain/order/types'
import { Order } from '@/domain/order/order.domain'

export class AdditionalPointsTariff implements ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  includedPoints: number
  price: number
  orderTypes: OrderType[]

  constructor(p: any) {
    const parsedData = AdditionalPointsTariff.validationSchema.parse(p)
    this.truckKinds = parsedData.truckKinds
    this.orderTypes = parsedData.orderTypes
    this.liftCapacities = parsedData.liftCapacities
    this.includedPoints = parsedData.includedPoints
    this.price = parsedData.price
  }

  canApplyToOrder(order: Order): boolean {
    return false
  }
  calculateForOrder(order: Order) {}

  static validationSchema = z.object({
    truckKinds: TruckKindsEnumSchema,
    liftCapacities: LiftCapacityEnumSchema,
    includedPoints: z.number().min(0),
    orderTypes: z.array(OrderTypeSchema).nonempty(),
    price: PriceSchema,
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
      orderTypes: [{ type: String, required: true, enum: ['region', 'city'] }],
      liftCapacities: [{ type: Number, required: true }],
      includedPoints: { type: Number },
      price: { type: Number },
    }
  }
}
