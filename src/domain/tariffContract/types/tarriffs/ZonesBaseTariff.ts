import { Types } from 'mongoose'
import { z } from 'zod'
import { TRUCK_KINDS_ENUM } from '@/constants/truck'
import { ICommonTariffFields, IContractDataForTariff } from '../common'
import { ZoneIdSchema, PriceSchema } from '../validationSchemes'
import { Order } from '@/domain/order/order.domain'
import { Agreement } from '@/domain/agreement/agreement.domain'
import { OrderPrice } from '@/domain/order/orderPrice'
import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'
import {
  TruckKindsEnumSchema,
  LiftCapacityEnumSchema,
} from '@/shared/validationSchemes'
import { mergeStringArrays } from '@/utils/mergeStringArrays'
import { AddressZone } from '@/domain/address'

export class ZonesBaseTariff implements ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  loadingZone: string
  unloadingZones: string[]
  price: number
  includedPoints: number = 2
  pointPrice: number = 0
  withVat?: boolean
  contractName?: string
  priority: number = 1
  contractDate?: Date

  constructor(p: any) {
    const parsedData = ZonesBaseTariff.validationSchema.parse(p)
    this.truckKinds = parsedData.truckKinds
    this.liftCapacities = parsedData.liftCapacities
    this.loadingZone = parsedData.loadingZone.toString()
    this.unloadingZones = parsedData.unloadingZones.map((i) => i.toString())
    this.includedPoints = parsedData.includedPoints
    this.pointPrice = parsedData.pointPrice
    this.price = parsedData.price
  }
  setPriority(zones: AddressZone[]): void {
    this.priority = this.unloadingZones.reduce((sum, zoneId) => {
      const zone = zones?.find((i) => i._id === zoneId)
      if (!zone) return sum
      return sum + zone.priority
    }, 0)
  }
  setContractData(contract: IContractDataForTariff): void {
    this.withVat = contract.withVat
    this.contractName = contract.contractName
    this.contractDate = contract.contractDate
  }
  getNoteString() {
    return `Тариф по зонам. Контракт: ${this.contractName || '--'} от ${
      this.contractDate?.toLocaleDateString() || '--'
    }`
  }

  canApplyToOrder(order: Order): boolean {
    const isStringArrayEqual = (a: string[], b: string[]): boolean =>
      a.length === b.length && a.every((val, idx) => val === b[idx])

    if (order.reqTransport === undefined) return false
    if (!this.truckKinds.includes(order.reqTransport.kind)) return false
    if (!this.liftCapacities.includes(order.reqTransport.liftCapacity))
      return false

    if (!order.analytics?.loadingZones?.includes(this.loadingZone)) return false
    if (!order.analytics?.unloadingZones) return false

    const allOrderZones: string[] = mergeStringArrays(
      order.analytics.loadingZones.filter((i) =>
        this.unloadingZones.includes(i)
      ),
      order.analytics.unloadingZones.filter((i) =>
        this.unloadingZones.includes(i)
      )
    )
    return (
      allOrderZones.length >= 1 &&
      isStringArrayEqual(allOrderZones, this.unloadingZones)
    )
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

  additionalPoints(countInOrder: number, vatRate: number): OrderPrice {
    const type = ORDER_PRICE_TYPES_ENUM.additionalPoints
    const additionalPoints = countInOrder - this.includedPoints
    const sum = additionalPoints > 0 ? this.pointPrice * additionalPoints : 0
    return this.calculatePrice(sum, vatRate, type)
  }

  calculateForOrder(order: Order, agreement: Agreement): OrderPrice[] {
    const vatRate = agreement.vatRate
    const type = ORDER_PRICE_TYPES_ENUM.base
    const routePointsCount =
      order.analytics?.routeStats?.countPoints || order.route.countOfPoints
    const pointsPrice = this.additionalPoints(routePointsCount, vatRate)
    return [this.calculatePrice(this.price, vatRate, type), pointsPrice]
  }

  static validationSchema = z.object({
    truckKinds: z.array(TruckKindsEnumSchema),
    liftCapacities: z.array(LiftCapacityEnumSchema),
    loadingZone: ZoneIdSchema,
    unloadingZones: z.array(ZoneIdSchema),
    price: PriceSchema,
    includedPoints: z.number().default(2),
    pointPrice: z.number().default(0),
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
      unloadingZones: [{ type: Types.ObjectId, ref: 'Zone' }],
      price: { type: Number },
      includedPoints: { type: Number },
      pointPrice: { type: Number },
    }
  }
}
