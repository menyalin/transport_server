import dayjs from 'dayjs'
import { RoutePoint } from '../../values/routePoint.js'
import { isDateRangesOverlapping } from '../../utils/isDateRangesOverlapping.js'

export class Order {
  constructor(order) {
    if (!order._id) throw new Error('Order : constructor : order ID is missing')
    if (!order.orderDate)
      throw new Error('Order : constructor : orderDate is missing')
    if (!Array.isArray(order.route) || order.route.length === 0)
      throw new Error('Order : constructor : invalid route')
    this._id = order._id
    this.state = order.state
    this.grade = order.grade
    this.orderDate = new Date(order.orderDate)
    this.route = order.route.map((point) => new RoutePoint(point))
    this.confirmedCrew = order.confirmedCrew
  }

  complete() {
    if (!this.grade?.grade) this.grade = { grade: 2 }
    this.state = {
      status: 'completed',
      driverNotified: true,
      clientNotified: true,
    }
  }

  get isCompleted() {
    return this.state.status === 'completed' && this.routeDatesFilled
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

  get firstArrivalDate() {
    return this.route[0].firstDate
  }

  get lastRouteDate() {
    return this.route.reduce(
      (lastDate, point) =>
        point.lastDate > lastDate ? point.lastDate : lastDate,
      null
    )
  }

  get routeDateRange() {
    if (!this.isCompleted) return null
    else return [this.firstArrivalDate, this.lastRouteDate]
  }

  get routeDatesFilled() {
    return this.route.every((p) => p.datesFilled)
  }

  fillRouteDatesAndComplete({
    minDate,
    tripDurationInMinutes,
    unloadingDurationInMinutes,
  }) {
    let updated = false
    let tmpDate =
      !minDate || minDate < this.orderDate ? this.orderDate : minDate

    this.route.forEach((point) => {
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

    if (this.routeDatesFilled && this.isInProgress) {
      updated = true
      this.complete()
    }
    // return { newDate: tmpDate, updated }
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
        minDate = order.lastDate
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
