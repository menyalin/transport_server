import { Types } from 'mongoose'
import { z } from 'zod'
import { TRUCK_KINDS_ENUM } from '../../../../constants/truck'
import { ICommonTariffFields } from '../common'
import {
  LiftCapacityEnumSchema,
  ZoneIdSchema,
  PriceSchema,
  TruckKindsEnumSchema,
} from '../validationSchemes'
import { Order } from '@/domain/order/order.domain'

export class ZonesBaseTariff implements ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  loadingZone: string
  unloadingZones: string[]
  price: number

  constructor(p: any) {
    const parsedData = ZonesBaseTariff.validationSchema.parse(p)
    this.truckKinds = parsedData.truckKinds
    this.liftCapacities = parsedData.liftCapacities
    this.loadingZone = parsedData.loadingZone.toString()
    this.unloadingZones = parsedData.unloadingZones.map((i) => i.toString())
    this.price = parsedData.price
  }

  static validationSchema = z.object({
    truckKinds: TruckKindsEnumSchema,
    liftCapacities: LiftCapacityEnumSchema,
    loadingZone: ZoneIdSchema,
    unloadingZones: z.array(ZoneIdSchema),
    price: PriceSchema,
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
      loadingZone: { type: Types.ObjectId, ref: 'Zone' },
      unloadingZones: [{ type: Types.ObjectId, ref: 'Zone' }],
      price: { type: Number },
    }
  }
}
