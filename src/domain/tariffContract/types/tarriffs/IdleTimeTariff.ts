import { TRUCK_KINDS_ENUM } from '@/constants/truck'
import { ICommonTariffFields, RoundByHours, TariffBy } from '../common'
import { TARIFF_ROUND_BY_HOURS_ENUM } from '@/constants/tariff'
import { z } from 'zod'
import {
  LiftCapacityEnumSchema,
  RoundByHoursSchema,
  TruckKindsEnumSchema,
} from '../validationSchemes'
import { OrderType, OrderTypeSchema } from '@/domain/order/types'
import { Order } from '@/domain/order/order.domain'

export class IdleTimeTariff implements ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  orderTypes: OrderType[]
  includeHours: number
  roundByHours: RoundByHours
  tariffBy: TariffBy
  price: number

  constructor(p: any) {
    const parsed = IdleTimeTariff.validationSchema.parse(p)
    this.truckKinds = parsed.truckKinds
    this.liftCapacities = parsed.liftCapacities
    this.orderTypes = parsed.orderTypes
    this.includeHours = parsed.includeHours
    this.roundByHours = parsed.roundByHours as RoundByHours
    this.tariffBy = parsed.tariffBy
    this.price = parsed.price
  }
  static validationSchema = z.object({
    truckKinds: TruckKindsEnumSchema,
    liftCapacities: LiftCapacityEnumSchema,
    includeHours: z.number(),
    roundByHours: RoundByHoursSchema,
    orderTypes: z.array(OrderTypeSchema).nonempty(),
    tariffBy: z.union([z.literal('hour'), z.literal('day')]),
    price: z.number(),
  })

  canApplyToOrder(order: Order): boolean {
    return false
  }
  calculateForOrder(order: Order) {}

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
      includeHours: { type: Number },
      roundByHours: { type: Number, enum: TARIFF_ROUND_BY_HOURS_ENUM }, // Кратность округления по часам
      tariffBy: { type: String, enum: ['hour', 'day'] },
      orderTypes: [{ type: String, required: true, enum: ['region', 'city'] }],
      price: { type: Number, required: true },
    }
  }
}
