import { z } from 'zod'
import { TRUCK_KINDS_ENUM } from '../../../../constants/truck'
import { ICommonTariffFields, OrderType } from '../common'
import {
  LiftCapacityEnumSchema,
  OrderTypeSchema,
  PriceSchema,
  TruckKindsEnumSchema,
} from '../validationSchemes'

export class AdditionalPointsTariff implements ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  includedPoints: number
  price: number
  orderType: OrderType

  constructor(p: any) {
    const parsedData = AdditionalPointsTariff.validationSchema.parse(p)
    this.truckKinds = parsedData.truckKinds
    this.orderType = parsedData.orderType
    this.liftCapacities = parsedData.liftCapacities
    this.includedPoints = parsedData.includedPoints
    this.price = parsedData.price
  }

  static validationSchema = z.object({
    truckKinds: TruckKindsEnumSchema,
    liftCapacities: LiftCapacityEnumSchema,
    includedPoints: z.number().min(0),
    orderType: OrderTypeSchema,
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
      orderType: { type: String, required: true, enum: ['region', 'city'] },
      liftCapacities: [{ type: Number, required: true }],
      includedPoints: { type: Number },
      price: { type: Number },
    }
  }
}
