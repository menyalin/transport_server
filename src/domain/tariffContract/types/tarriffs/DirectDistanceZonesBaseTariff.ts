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
  includedPoints: number = 2
  pointPrice: number = 0

  constructor(p: any) {
    const parsed = DirectDistanceZonesBaseTariff.validationSchema.parse(p)
    this.truckKinds = parsed.truckKinds
    this.liftCapacities = parsed.liftCapacities
    this.loadingZone = parsed.loadingZone.toString()
    this.zones = parsed.zones.sort((a, b) => a.distance - b.distance)
    this.includedPoints = parsed.includedPoints
    this.pointPrice = parsed.pointPrice
  }

  private get maxDistance(): number {
    return Math.max(...this.zones.map((i) => i.distance))
  }

  static validationSchema = z.object({
    truckKinds: z.array(TruckKindsEnumSchema),
    liftCapacities: z.array(LiftCapacityEnumSchema),
    loadingZone: ZoneIdSchema,
    zones: z.array(TariffZoneSchema),
    includedPoints: z.number().default(2),
    pointPrice: z.number().default(2),
  })

  setContractData(data: IContractDataForTariff) {
    this.withVat = data.withVat
    this.contractName = data.contractName
    this.contractDate = data.contractDate
  }
  getNoteString(): string {
    return `Тариф по линейке. Контракт: ${this.contractName || '--'} от ${
      this.contractDate?.toLocaleDateString() || '--'
    }`
  }

  canApplyToOrder(order: Order): boolean {
    if (order.reqTransport === undefined) return false
    if (!this.truckKinds.includes(order.reqTransport.kind)) return false
    if (!this.liftCapacities.includes(order.reqTransport.liftCapacity))
      return false
    if (order.analytics?.distanceDirect === 0) return false
    if (!order.analytics?.loadingZones?.includes(this.loadingZone)) return false
    if (this.zones.length === 0) return false
    if (order.analytics.distanceDirect > this.maxDistance) return false
    return true
  }

  private calculatePrice(
    sum: number,
    vatRate: number,
    type: ORDER_PRICE_TYPES_ENUM
  ): OrderPrice {
    if (this.withVat === undefined)
      throw new Error(`${type} : "withVat" param is undefined`)

    const priceWOVat = this.withVat ? sum / (1 + vatRate / 100) : sum
    const sumVat = this.withVat ? sum - priceWOVat : (sum * vatRate) / 100

    return new OrderPrice({
      type,
      price: this.withVat ? sum : sum + sumVat,
      priceWOVat,
      sumVat,
      note: this.getNoteString(),
    })
  }

  private getZonePriceByDistance(distance: number = 0): number {
    if (!distance) return 0
    const zone = this.zones.find((i) => i.distance > distance)
    return zone?.price || 0
  }

  additionalPoints(countInOrder: number, vatRate: number): OrderPrice {
    const type = ORDER_PRICE_TYPES_ENUM.additionalPoints
    const additionalPoints = countInOrder - this.includedPoints
    const sum = additionalPoints > 0 ? this.pointPrice * additionalPoints : 0
    return this.calculatePrice(sum, vatRate, type)
  }

  calculateForOrder(order: Order, agreement: Agreement): OrderPrice[] {
    const vatRate = agreement.vatRate
    const type = ORDER_PRICE_TYPES_ENUM.base
    const priceByZone = this.getZonePriceByDistance(
      order.analytics?.distanceDirect
    )
    const routePointsCount =
      order.analytics?.routeStats?.countPoints || order.route.countOfPoints
    const pointsPrice = this.additionalPoints(routePointsCount, vatRate)
    return [this.calculatePrice(priceByZone, vatRate, type), pointsPrice]
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
      includedPoints: { type: Number, default: 2 },
      pointPrice: { type: Number, default: 0 },
    }
  }
}
