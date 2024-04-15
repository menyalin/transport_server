import { TRUCK_KINDS_ENUM } from '../../../../constants/truck'
import {
  ICommonTariffFields,
  OrderType,
  RoundByHours,
  TariffBy,
} from '../common'
import { TARIFF_ROUND_BY_HOURS_ENUM } from '../../../../constants/tariff'
import { z } from 'zod'
import {
  LiftCapacityEnumSchema,
  OrderTypeSchema,
  RoundByHoursSchema,
  TruckKindsEnumSchema,
} from '../validationSchemes'

export class IdleTimeTariff implements ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  includeHours: number
  orderType: OrderType

  roundByHours: RoundByHours
  tariffBy: TariffBy
  price: number

  constructor(p: any) {
    const parsed = IdleTimeTariff.validationSchema.parse(p)
    this.truckKinds = parsed.truckKinds
    this.orderType = parsed.orderType
    this.liftCapacities = parsed.liftCapacities
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
    orderType: OrderTypeSchema,
    tariffBy: z.union([z.literal('hour'), z.literal('day')]),
    price: z.number(),
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
      includeHours: { type: Number },
      roundByHours: { type: Number, enum: TARIFF_ROUND_BY_HOURS_ENUM }, // Кратность округления по часам
      tariffBy: { type: String, enum: ['hour', 'day'] },
      orderType: { type: String, required: true, enum: ['region', 'city'] },
      price: { type: Number, required: true },
    }
  }
}
