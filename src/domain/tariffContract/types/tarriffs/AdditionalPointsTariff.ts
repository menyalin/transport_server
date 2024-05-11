import { z } from 'zod'
import { TRUCK_KINDS_ENUM } from '@/constants/truck'
import { LiftCapacityEnumSchema, PriceSchema } from '../validationSchemes'
import { OrderType, OrderTypeSchema } from '@/domain/order/types'
import { Order } from '@/domain/order/order.domain'
import { TruckKindsEnumSchema } from '@/shared/validationSchemes'
import { Agreement } from '@/domain/agreement/agreement.domain'
import { OrderPrice } from '@/domain/order/orderPrice'
import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'

export class AdditionalPointsTariff {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  includedPoints: number
  price: number
  orderTypes: OrderType[]
  withVat?: boolean | undefined

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
  calculateForOrder(order: Order, agreement: Agreement): OrderPrice {
    return new OrderPrice({
      type: ORDER_PRICE_TYPES_ENUM.additionalPoints,
      price: 0,
      priceWOVat: 0,
      sumVat: 0,
    })
  }

  setWithVat(val: boolean) {
    this.withVat = val
  }

  static validationSchema = z.object({
    truckKinds: z.array(TruckKindsEnumSchema),
    liftCapacities: z.array(LiftCapacityEnumSchema),
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
