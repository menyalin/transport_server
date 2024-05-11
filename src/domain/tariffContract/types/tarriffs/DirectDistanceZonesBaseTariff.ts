import z from 'zod'
import { Types } from 'mongoose'
import { TRUCK_KINDS_ENUM } from '../../../../constants/truck'
import { ICommonTariffFields, IContractDataForTariff } from '../common'
import {
  LiftCapacityEnumSchema,
  TariffZoneSchema,
  ZoneIdSchema,
} from '../validationSchemes'
import { Order } from '@/domain/order/order.domain'
import { OrderPrice } from '@/domain/order/orderPrice'
import { Agreement } from '@/domain/agreement/agreement.domain'
import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'
import { TruckKindsEnumSchema } from '@/shared/validationSchemes'
import { isThisTypeNode } from 'typescript'

type TariffZone = {
  distance: number
  price: number
}

export class DirectDistanceZonesBaseTariff implements ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  loadingZone: string
  zones: TariffZone[]
  withVat?: boolean
  contractName?: string
  contractDate?: Date

  constructor(p: any) {
    const parsed = DirectDistanceZonesBaseTariff.validationSchema.parse(p)
    this.truckKinds = parsed.truckKinds
    this.liftCapacities = parsed.liftCapacities
    this.loadingZone = parsed.loadingZone.toString()
    this.zones = parsed.zones.sort((a, b) => a.distance - b.distance)
  }

  static validationSchema = z.object({
    truckKinds: z.array(TruckKindsEnumSchema),
    liftCapacities: z.array(LiftCapacityEnumSchema),
    loadingZone: ZoneIdSchema,
    zones: z.array(TariffZoneSchema),
  })
  setContractData(data: IContractDataForTariff) {
    this.withVat = data.withVat
    this.contractName = data.contractName
    this.contractDate = data.contractDate
  }
  getNoteString(): string {
    return `Тариф расстояния по линейке. Контракт: ${
      this.contractName || '--'
    } от ${this.contractDate?.toDateString() || '--'}`
  }

  canApplyToOrder(order: Order): boolean {
    return false
  }

  calculateForOrder(order: Order, agreement: Agreement): OrderPrice[] {
    const type = ORDER_PRICE_TYPES_ENUM.base
    return [
      new OrderPrice({
        type,
        priceWOVat: 0,
        price: 0,
        sumVat: 0,
      }),
    ]
  }

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
