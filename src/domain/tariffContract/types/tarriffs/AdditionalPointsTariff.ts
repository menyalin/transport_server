import { z } from 'zod'
import { TRUCK_KINDS_ENUM } from '../../../../constants/truck'
import { ICommonTariffFields } from '../common'
import {
  LiftCapacityEnumSchema,
  PriceSchema,
  TruckKindsEnumSchema,
} from '../validationSchemes'

export class AdditionalPointsTariff implements ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  includedPoints: number
  price: number

  constructor(p: any) {
    const parsedData = AdditionalPointsTariff.validationSchema.parse(p)
    this.truckKinds = parsedData.truckKinds
    this.liftCapacities = parsedData.liftCapacities
    this.includedPoints = parsedData.includedPoints
    this.price = parsedData.price
  }

  static validationSchema = z.object({
    truckKinds: TruckKindsEnumSchema,
    liftCapacities: LiftCapacityEnumSchema,
    includedPoints: z.number().min(0),
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
      liftCapacities: [{ type: Number, required: true }],
      includedPoints: { type: Number },
      price: { type: Number },
    }
  }
}
