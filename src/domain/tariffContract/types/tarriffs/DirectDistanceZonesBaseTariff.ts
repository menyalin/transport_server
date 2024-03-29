import z from 'zod'
import { Types } from 'mongoose'
import { TRUCK_KINDS_ENUM } from '../../../../constants/truck'
import { ICommonTariffFields } from '../common'
import {
  LiftCapacityEnumSchema,
  TariffZoneSchema,
  TruckKindsEnumSchema,
  ZoneIdSchema,
} from '../validationSchemes'

type TariffZone = {
  distance: number
  price: number
}

export class DirectDistanceZonesBaseTariff implements ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  loadingZone: string
  zones: TariffZone[]

  constructor(p: any) {
    const parsed = DirectDistanceZonesBaseTariff.validationSchema.parse(p)
    this.truckKinds = parsed.truckKinds
    this.liftCapacities = parsed.liftCapacities
    this.loadingZone = parsed.loadingZone
    this.zones = parsed.zones.sort((a, b) => a.distance - b.distance)
  }

  static validationSchema = z.object({
    truckKinds: TruckKindsEnumSchema,
    liftCapacities: LiftCapacityEnumSchema,
    loadingZone: ZoneIdSchema,
    zones: z.array(TariffZoneSchema),
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
      loadingZone: { type: Types.ObjectId, ref: 'Zone' },
      zones: [
        {
          distance: Number,
          price: Number,
        },
      ],
    }
  }
}
