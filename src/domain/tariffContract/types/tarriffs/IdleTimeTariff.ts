import dayjs from 'dayjs'
import { TRUCK_KINDS_ENUM } from '@/constants/truck'
import {
  ICommonTariffFields,
  IContractDataForTariff,
  TariffBy,
} from '../common'
import { z } from 'zod'
import { LiftCapacityEnumSchema } from '../validationSchemes'
import { OrderType, OrderTypeSchema } from '@/domain/order/types'
import { Order } from '@/domain/order/order.domain'
import {
  TruckKindsEnumSchema,
  idleTimeRoundingIntervalSchema,
} from '@/shared/validationSchemes'
import { Agreement } from '@/domain/agreement/agreement.domain'
import { OrderPrice } from '@/domain/order/orderPrice'
import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'
import { RoutePoint } from '@/values/order/routePoint'
import {
  IdleTimeRoundingIntervalEnum,
  TARIFF_ROUND_BY_HOURS_ENUM,
} from '@/constants/tariff'

type IdleType =
  | ORDER_PRICE_TYPES_ENUM.loadingDowntime
  | ORDER_PRICE_TYPES_ENUM.unloadingDowntime
  | ORDER_PRICE_TYPES_ENUM.returnDowntime

export class IdleTimeTariff implements ICommonTariffFields {
  truckKinds: TRUCK_KINDS_ENUM[]
  liftCapacities: number[]
  orderTypes: OrderType[]
  includeHours: number
  roundingInterval: IdleTimeRoundingIntervalEnum
  tariffBy: TariffBy
  price: number
  withVat?: boolean
  contractName?: string
  contractDate?: Date

  constructor(p: any) {
    const parsed = IdleTimeTariff.validationSchema.parse(p)
    this.truckKinds = parsed.truckKinds
    this.liftCapacities = parsed.liftCapacities
    this.orderTypes = parsed.orderTypes
    this.includeHours = parsed.includeHours
    this.roundingInterval = parsed.roundingInterval
    this.tariffBy = parsed.tariffBy
    this.price = parsed.price
  }

  get pricePerMinute() {
    return this.tariffBy === 'hour' ? this.price / 60 : this.price / (60 * 24)
  }
  get includedMinutes() {
    return this.includeHours * 60
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

  private idleTimeInMinutes(
    order: Order,
    agreement: Agreement,
    idleType: IdleType
  ): number[] {
    let noWaitingPaymentForAreLate: boolean
    let calcWaitingByArrivalDate: boolean
    let points: RoutePoint[] = []

    switch (idleType) {
      case ORDER_PRICE_TYPES_ENUM.loadingDowntime:
        points = order.route.allLoadingPoints
        noWaitingPaymentForAreLate = agreement.noWaitingPaymentForAreLateLoading
        calcWaitingByArrivalDate = agreement.calcWaitingByArrivalDateLoading
        break
      case ORDER_PRICE_TYPES_ENUM.unloadingDowntime:
        points = order.route.allUnloadingPoints
        noWaitingPaymentForAreLate =
          agreement.noWaitingPaymentForAreLateUnloading
        calcWaitingByArrivalDate = agreement.calcWaitingByArrivalDateUnloading
        break
      case ORDER_PRICE_TYPES_ENUM.returnDowntime:
        points = order.route.allReturnPoints
        noWaitingPaymentForAreLate =
          agreement.noWaitingPaymentForAreLateUnloading
        calcWaitingByArrivalDate = agreement.calcWaitingByArrivalDateUnloading
        break
      default:
        throw new Error(
          'IdleTimeTariff : idleTimeInMinutes : invalid idleType arg'
        )
    }
    const res: number[] = []
    points.forEach((point) => {
      if (
        !point.firstDate ||
        !point.isCompleted ||
        (noWaitingPaymentForAreLate && point.isLate)
      )
        res.push(0)
      else {
        const startDate =
          !point.plannedDate ||
          +point.plannedDate < +point.firstDate ||
          calcWaitingByArrivalDate
            ? point.firstDate
            : point.plannedDate
        const minutesDiff = dayjs(point.lastDate).diff(startDate, 'm')
        res.push(minutesDiff)
      }
    })
    return res
  }

  private getRoundedMinutes(totalMinutes: number): number {
    let roundedMinutes: number
    switch (this.roundingInterval) {
      case 'minute':
        // Округление до ближайшей минуты
        roundedMinutes = Math.round(totalMinutes)
        break
      case 'halfHour':
        // Округление до ближайших 30 минут
        roundedMinutes = Math.round(totalMinutes / 30) * 30
        break
      case 'hour':
        // Округление до ближайшего часа
        roundedMinutes = Math.round(totalMinutes / 60) * 60
        break
      case 'twelveHours':
        // Округление до ближайших 12 часов
        roundedMinutes = Math.round(totalMinutes / 720) * 720
        break
      case 'day':
        // Округление до ближайшего дня (24 часа)
        roundedMinutes = Math.round(totalMinutes / 1440) * 1440
        break
      default:
        throw new Error('Неверный интервал округления')
    }
    return roundedMinutes
  }

  private calcSum(idleTimeinMinutes: number[] = []): number {
    return idleTimeinMinutes
      .map((i) => i - this.includedMinutes)
      .filter((i) => i > 0)
      .reduce((sum, downtime) => {
        return (
          sum +
          Math.round(
            this.getRoundedMinutes(downtime) * this.pricePerMinute * 100
          ) /
            100
        )
      }, 0)
  }

  canApplyToOrder(order: Order): boolean {
    if (!order.analytics?.type) return false
    if (!order.reqTransport) return false
    if (!this.truckKinds.includes(order.reqTransport.kind)) return false
    if (!this.liftCapacities.includes(order.reqTransport.liftCapacity))
      return false
    if (!this.orderTypes.includes(order.analytics?.type)) return false
    return true
  }

  calculateForOrder(order: Order, agreement: Agreement): OrderPrice[] {
    const vatRate = agreement.vatRate
    const loadingDowntimeInMinutes: number[] = this.idleTimeInMinutes(
      order,
      agreement,
      ORDER_PRICE_TYPES_ENUM.loadingDowntime
    )
    const unloadingDowntimeInMinutes: number[] = this.idleTimeInMinutes(
      order,
      agreement,
      ORDER_PRICE_TYPES_ENUM.unloadingDowntime
    )
    const returnDowntimeInMinutes: number[] = this.idleTimeInMinutes(
      order,
      agreement,
      ORDER_PRICE_TYPES_ENUM.returnDowntime
    )

    return [
      this.calculatePrice(
        this.calcSum(loadingDowntimeInMinutes),
        vatRate,
        ORDER_PRICE_TYPES_ENUM.loadingDowntime
      ),
      this.calculatePrice(
        this.calcSum(unloadingDowntimeInMinutes),
        vatRate,
        ORDER_PRICE_TYPES_ENUM.unloadingDowntime
      ),
      this.calculatePrice(
        this.calcSum(returnDowntimeInMinutes),
        vatRate,
        ORDER_PRICE_TYPES_ENUM.returnDowntime
      ),
    ]
  }

  setContractData(data: IContractDataForTariff) {
    this.withVat = data.withVat
    this.contractName = data.contractName
    this.contractDate = data.contractDate
  }
  getNoteString(): string {
    return `Простой. Контракт: ${this.contractName || '--'} от ${
      this.contractDate?.toLocaleDateString() || '--'
    }`
  }

  static validationSchema = z.object({
    truckKinds: z.array(TruckKindsEnumSchema),
    liftCapacities: z.array(LiftCapacityEnumSchema),
    includeHours: z.number(),
    roundingInterval: idleTimeRoundingIntervalSchema,

    orderTypes: z.array(OrderTypeSchema).nonempty(),
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
      roundingInterval: { type: String },
      roundByHours: { type: Number, enum: TARIFF_ROUND_BY_HOURS_ENUM }, // Кратность округления по часам
      tariffBy: { type: String, enum: ['hour', 'day'] },
      orderTypes: [{ type: String, required: true, enum: ['region', 'city'] }],
      price: { type: Number, required: true },
    }
  }
}
