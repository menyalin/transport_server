// @ts-nocheck
import dayjs from 'dayjs'
import { BadRequestError } from '../../helpers/errors'
import { isDateRangesOverlapping } from '../../utils/isDateRangesOverlapping'
import { Route } from '../../values/order/route'

export class Order {
  static getOrderDate(order) {
    if (order?.orderDate) return new Date(order.orderDate)
    const tmpDate = order.route[0].plannedDateDoc || order.route[0].plannedDate
    return new Date(tmpDate)
  }

  static orderStatusValidator(orderBody) {
    // Проверка наличия комментария,
    const STATUSES = ['weRefused', 'clientRefused', 'notСonfirmedByClient']
    if (STATUSES.includes(orderBody?.state?.status) && !orderBody.note)
      throw new BadRequestError(
        'Сохранение не возможно. Необходимо заполнить примечание или изменить статус рейса'
      )
    return
  }

  constructor(order) {
    Order.orderStatusValidator(order)

    if (!order._id) throw new Error('Order : constructor : order ID is missing')

    if (!Array.isArray(order.route) || order.route.length === 0)
      throw new Error('Order : constructor : invalid route')
    this.startPositionDate = order.startPositionDate
      ? new Date(order.startPositionDate)
      : null
    this._id = order._id
    this.state = order.state
    this.grade = order.grade
    this.company = order.company
    this.orderDate = Order.getOrderDate(order)
    this.route = new Route(order.route)
    this.confirmedCrew = order.confirmedCrew
    this.docs = order.docs
    this.client = order.client
    this.prePrices = order.prePrices
    this.prices = order.prices
    this.finalPrices = order.finalPrices
    this.outsourceCosts = order.outsourceCosts
    this.cargoParams = order.cargoParams
    this.reqTransport = order.reqTransport
    this.paymentParts = order.paymentParts
    this.analytics = order.analytics
    this.docsState = order.docsState
    this.paymentToDriver = order.paymentToDriver
    this.note = order.note
    this.noteAccountant = order.noteAccountant
    this.isActive = order.isActive
    this.isDisabled = order.isDisabled
  }

  complete() {
    if (!this.grade?.grade) this.grade = { grade: 2 }
    this.state = {
      status: 'completed',
      driverNotified: true,
      clientNotified: true,
    }
  }

  unlock() {
    this.isDisabled = false
  }

  get id() {
    return this._id?.toString()
  }

  get isCompleted() {
    return this.state.status === 'completed' && this.route.routeDatesFilled
  }

  isEqual(inputId) {
    return this._id === inputId || this._id.toString() === inputId.toString()
  }

  get isInProgress() {
    return this.state.status === 'inProgress'
  }

  get truckId() {
    return this.confirmedCrew.truck.toString()
  }

  get routeDateRange() {
    if (!this.isCompleted) return null
    else return [this.route.firstArrivalDate, this.route.lastRouteDate]
  }

  fillRouteDatesAndComplete({
    minDate,
    tripDurationInMinutes,
    unloadingDurationInMinutes,
  }) {
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
    orders,
    tripDurationInMinutes = 30,
    unloadingDurationInMinutes = 15
  ) {
    const updatedOrders = []

    const events = []

    if (!Array.isArray(orders))
      throw new Error(
        'OrderDomain:autoCompleteOrders error : orders unexpected type'
      )
    if (orders.length === 0) return { updatedOrders, events }

    if (new Set(orders.map((order) => order.truckId)).size !== 1)
      throw new Error(
        'OrderDomain:autoCompleteOrders error : trucks count !== 1'
      )
    orders.sort((a, b) => a.orderDate - b.orderDate)
    var minDate

    for (let order of orders) {
      let updated = false
      if (order.isCompleted) {
        minDate = order.route.lastDate
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
}
