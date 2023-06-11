import { RoutePoint } from './routePoint.js'

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
}
