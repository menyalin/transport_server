import dayjs from 'dayjs'
import { isDateRangesOverlapping } from '../../utils/isDateRangesOverlapping'
import { Route } from '../../values/order/route'

import { ORDER_DOMAIN_EVENTS, OrderRemoveEvent } from './domainEvents'
import { BusEvent } from 'ts-bus/types'
import { NotifyClientsEvent } from '../../socket/notifyClientsEvent'
import { Client } from './client'
import { RoutePoint } from '../../values/order/routePoint'
import { OrderPrice } from './orderPrice'
import { ORDER_PRICE_TYPES_ENUM } from '../../constants/priceTypes'
import { BadRequestError } from '../../helpers/errors'
import { OrderAnalytics } from './analytics'

export interface IOrderDTO {
  _id: string
  orderDate?: string | Date
  startPositionDate?: Date | string
  route: RoutePoint[] | any[]
  state: {
    status: string
    driverNotified?: boolean
    clientNotified?: boolean
  }
  grade?: object
  company: string
  confirmedCrew: {
    truck: string
    trailer?: string
    driver?: string
    outsourceAgreement?: string
    tkName?: string
  }
  docs?: []
  client: {
    client: string
  }
  prePrices?: any[]
  prices?: any[]
  finalPrices?: any[]
  outsourceCosts?: []
  cargoParams?: object
  reqTransport?: object
  paymentParts?: []
  analytics?: any
  docsState?: object
  paymentToDriver?: object
  note?: string
  noteAccountant?: string
  isActive?: boolean
  isDisabled?: boolean
}

export class Order {
  events: BusEvent<any>[] = []
  _id: string
  state: {
    status: string
    driverNotified?: boolean
    clientNotified?: boolean
  }
  startPositionDate?: Date | null
  grade: {
    grade?: number
  }
  company: string
  orderDate: Date
  route: Route
  confirmedCrew: {
    truck: string
    trailer?: string
    driver?: string
    outsourceAgreement?: string
    tkName?: string
  }
  docs: []
  client: Client
  prePrices?: OrderPrice[]
  prices?: OrderPrice[]
  finalPrices?: OrderPrice[]
  outsourceCosts: []
  cargoParams: object
  reqTransport: object
  paymentParts: []
  analytics?: OrderAnalytics
  docsState?: object
  paymentToDriver?: object
  note?: string
  noteAccountant?: string
  isActive: boolean = true
  isDisabled: boolean = false

  constructor(order: IOrderDTO) {
    Order.orderStatusValidator(order)

    if (!order._id) throw new Error('Order : constructor : order ID is missing')

    if (!Array.isArray(order.route) || order.route.length === 0)
      throw new Error('Order : constructor : invalid route')
    this.startPositionDate = order.startPositionDate
      ? new Date(order.startPositionDate)
      : null

    this._id = order._id.toString()
    this.state = order.state
    this.grade = order.grade || {}
    this.company = order.company.toString()
    this.orderDate = Order.getOrderDate(order)
    this.route = new Route(order.route)
    this.confirmedCrew = order.confirmedCrew
    this.docs = order.docs || []
    this.client = new Client(order.client)
    if (Array.isArray(order.prePrices))
      this.prePrices = order.prePrices?.map((i) => new OrderPrice(i))
    if (Array.isArray(order.prices))
      this.prices = order.prices?.map((i) => new OrderPrice(i))
    if (Array.isArray(order.finalPrices))
      this.finalPrices = order.finalPrices?.map((i) => new OrderPrice(i))
    this.outsourceCosts = order.outsourceCosts || []
    this.cargoParams = order.cargoParams || {}
    this.reqTransport = order.reqTransport || {}
    this.paymentParts = order.paymentParts || []
    this.analytics = new OrderAnalytics(order.analytics)
    this.docsState = order.docsState
    this.paymentToDriver = order.paymentToDriver
    this.note = order.note
    this.noteAccountant = order.noteAccountant
    this.isActive = order.isActive !== undefined ? order.isActive : true
    this.isDisabled = order.isDisabled || false
    if (this.state.status === 'completed' && !this.isReadyToComplete)
      throw new BadRequestError(
        'Изменение статуса рейса на "Выполнен" не возможно! Проверьте корректность заполнения базового тарифа и временных отметок в рейсе'
      )
  }

  clearEvents() {
    this.events = []
  }

  get clientId(): string {
    return this.client.client
  }

  remove(userId: string) {
    if (this?.state?.status === 'needGet') {
      this.events.push(OrderRemoveEvent({ orderId: this.id }))
      this.events.push(
        NotifyClientsEvent({
          subscriber: this.company.toString(),
          topic: ORDER_DOMAIN_EVENTS.deleted,
          payload: this.id,
        })
      )
    }
  }
  toObject(): object {
    const obj: { [key: string]: any } = {}
    Object.getOwnPropertyNames(this).forEach((prop: string) => {
      obj[prop] = (this as any)[prop]
    })
    obj.route = obj.route.route
    return obj
  }

  complete() {
    if (!this.grade?.grade) this.grade = { grade: 2 }
    this.state = {
      status: 'completed',
      driverNotified: true,
      clientNotified: true,
    }
  }

  setDisableStatus(status: boolean) {
    this.isDisabled = status
  }

  setFinalPrices(prices: any[]) {
    this.finalPrices = prices.map((price) => new OrderPrice(price))
  }

  get activePoints(): RoutePoint[] {
    return this.route.activePoints
  }
  get completedPoints() {
    return this.route.completedPoints
  }

  get id() {
    return this._id?.toString()
  }
  get basePrice(): OrderPrice | null {
    const finalPrice =
      this.finalPrices?.find((i) => i.type === ORDER_PRICE_TYPES_ENUM.base) ||
      null
    const price =
      this.prices?.find((i) => i.type === ORDER_PRICE_TYPES_ENUM.base) || null
    const prePrice =
      this.prePrices?.find((i) => i.type === ORDER_PRICE_TYPES_ENUM.base) ||
      null
    return finalPrice || price || prePrice || null
  }

  get isReadyToComplete(): Boolean {
    return !!this.basePrice && this.route.routeDatesFilled
  }

  get isCompleted() {
    return this.state.status === 'completed' && this.route.routeDatesFilled
  }

  isEqual(inputId: string) {
    return this._id === inputId || this._id.toString() === inputId.toString()
  }

  get isInProgress() {
    return this.state.status === 'inProgress'
  }

  get truckId() {
    return this.confirmedCrew.truck.toString()
  }

  get routeDateRange(): [Date, Date] | null {
    if (!this.isCompleted) return null
    if (!this.route.firstArrivalDate || !this.route.lastRouteDate) return null
    else return [this.route.firstArrivalDate, this.route.lastRouteDate]
  }

  fillRouteDatesAndComplete({
    minDate,
    tripDurationInMinutes,
    unloadingDurationInMinutes,
  }: {
    minDate: Date | null
    tripDurationInMinutes: number
    unloadingDurationInMinutes: number
  }): [Date, boolean] {
    let updated = false
    let tmpDate =
      !minDate || minDate < this.orderDate ? this.orderDate : minDate

    // TODO: Перенести логику заполнения в Route.js
    this.route.route.forEach((point) => {
      tmpDate = point.autofillDates({
        minDate: tmpDate,
        unloadingDurationInMinutes,
      })
      tmpDate = new Date(
        dayjs(tmpDate)
          .add(tripDurationInMinutes || 30, 'minutes')
          .toISOString()
      )
    })

    if (this.route.routeDatesFilled && this.isInProgress) {
      updated = true
      this.complete()
    }
    return [tmpDate, updated]
  }

  static autoCompleteOrders(
    orders: Order[],
    tripDurationInMinutes = 30,
    unloadingDurationInMinutes = 15
  ) {
    const updatedOrders: Order[] = []

    const events: object[] = []

    if (!Array.isArray(orders))
      throw new Error(
        'OrderDomain:autoCompleteOrders error : orders unexpected type'
      )
    if (orders.length === 0) return { updatedOrders, events }

    if (new Set(orders.map((order) => order.truckId)).size !== 1)
      throw new Error(
        'OrderDomain:autoCompleteOrders error : trucks count !== 1'
      )
    orders.sort((a, b) => +a.orderDate - +b.orderDate)
    let minDate = null

    for (let order of orders) {
      let updated: boolean = false
      if (order.isCompleted) {
        minDate = order.route.lastRouteDate
      } else if (order.isInProgress) {
        ;[minDate, updated] = order.fillRouteDatesAndComplete({
          minDate,
          tripDurationInMinutes,
          unloadingDurationInMinutes,
        })
        const orderDateRanges = orders
          .filter((o) => o.isCompleted)
          .map((o) => o.routeDateRange)

        if (isDateRangesOverlapping(orderDateRanges)) {
          events.push({ event: 'order_update_error' })
          break
        }
        if (updated) updatedOrders.push(order)
      }
    }
    return {
      events,
      updatedOrders,
    }
  }

  static getOrderDate(order: IOrderDTO): Date {
    if (order?.orderDate) return new Date(order.orderDate)
    const route: Route = new Route(order.route)
    return route.orderDate
  }

  static orderStatusValidator(orderBody: IOrderDTO) {
    // Проверка наличия комментария,
    const STATUSES = ['weRefused', 'clientRefused', 'notСonfirmedByClient']
    if (STATUSES.includes(orderBody?.state?.status) && !orderBody.note)
      throw new Error(
        'Сохранение не возможно. Необходимо заполнить примечание или изменить статус рейса'
      )
    return
  }
}
