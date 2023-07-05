// @ts-nocheck
import dayjs from 'dayjs'
import { RoutePoint } from './routePoint'

export class Route {
  static validateRoute(route, method = '') {
    if (!route || !Array.isArray(route))
      throw new Error(`Route : ${method} : unexpected route type`)
    if (route.length < 2)
      throw new Error(`Route : ${method} : invalid length of array`)
  }

  constructor(route) {
    Route.validateRoute(route, 'constructor')
    this.route = route.map((p) => new RoutePoint(p))
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

  get routeDatesFilled() {
    return this.route.every((p) => p.datesFilled)
  }

  get countOfPoints() {
    return this.route.filter((i) => !i.isReturnPoint).length
  }

  get loadingTimesInMinutes() {
    return this.route
      .filter((i) => i.isLoadingPointType)
      .map((i) => i.getDurationInMinutes)
  }

  get unloadingTimesInMinutes() {
    return this.route
      .filter((i) => !i.isLoadingPointType)
      .map((i) => i.getDurationInMinutes)
  }

  tripTimes(unit) {
    const res = []
    for (let i = 1; i < this.route.length; i++) {
      const prev = this.route[i - 1]
      const current = this.route[i]
      if (prev.datesFilled && !!current.firstDate)
        res.push(dayjs(current.firstDate).diff(prev.lastDate, unit))
      else res.push(0)
    }
    return res
  }

  totalDuration(unit) {
    const dates = this.route
      .reduce((arr, item) => [...arr, item.firstDate, item.lastDate], [])
      .filter((i) => !!i)
    if (dates.length <= 1) return 0
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    return dayjs(maxDate).diff(minDate, unit)
  }

  toJSON() {
    return this.route
  }
  toObject() {
    console.log('toObject: ', this.route)
    return Object.assign(this.route)
  }
}
