import { z } from 'zod'
import { TRUCK_KINDS_ENUM } from '../../../../constants/truck'
import { ICommonTariffFields } from '../common'
import {
  LiftCapacityEnumSchema,
  TruckKindsEnumSchema,
} from '../validationSchemes'

export class ReturnPercentTariff implements ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  percent: number

  constructor(p: any) {
    const parsedData = ReturnPercentTariff.validationSchema.parse(p)
    this.truckKinds = parsedData.truckKinds
    this.liftCapacities = parsedData.liftCapacities
    this.percent = parsedData.percent
  }

  static validationSchema = z.object({
    truckKinds: TruckKindsEnumSchema,
    liftCapacities: LiftCapacityEnumSchema,
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
