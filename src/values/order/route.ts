import dayjs, { UnitType } from 'dayjs'
import { RoutePoint } from './routePoint'
import { isDate } from '../../utils/typeGuards'

export class Route {
  route: RoutePoint[]
  static validateRoute(route: RoutePoint[], method = '') {
    if (!route || !Array.isArray(route))
      throw new Error(`Route : ${method} : unexpected route type`)
    if (route.length < 2)
      throw new Error(`Route : ${method} : invalid length of array`)
  }

  constructor(route: any[]) {
    Route.validateRoute(route, 'constructor')
    this.route = route.map((p) =>
      p instanceof RoutePoint ? p : new RoutePoint(p)
    )
    if (!this.hasMainLoadingPoints) this.route[0].setMainLoadingPoint()
  }

  get activePoints(): RoutePoint[] {
    // Ищем все выполненные точки и первую незавершенную
    const res: RoutePoint[] = this.route.filter((point) => point.isCompleted)
    const currentPoint = this.route.find((p) => !p.isCompleted)
    if (currentPoint) res.push(currentPoint)
    return res
  }
  get hasMainLoadingPoints(): boolean {
    return this.route.some((i) => i.isMainLoadingPoint)
  }

  get hasReturn(): boolean {
    const point = this.route.find((i) => i.isReturn)
    return Boolean(point)
  }

  get mainLoadingPoint(): RoutePoint {
    const point: RoutePoint =
      this.route.find((i) => i.isMainLoadingPoint) ?? this.route[0]
    if (!point.isMainLoadingPoint) point.setMainLoadingPoint()
    return point
  }
  get allLoadingPoints(): RoutePoint[] {
    return this.route.filter((i) => i.type === 'loading').slice()
  }

  get allUnloadingPoints(): RoutePoint[] {
    return this.route
      .filter((i) => i.type === 'unloading' && !i.isReturn)
      .slice()
  }

  get allReturnPoints(): RoutePoint[] {
    return this.route.filter((i) => i.isReturn).slice()
  }

  get pointsAfterMainLoadingPoint(): RoutePoint[] {
    let points = this.route.filter((i) => !i.isReturnPoint) // выкидываю все точки с возвратом

    const idxMainLoadingPoint = points.findIndex((i) => i.isMainLoadingPoint)

    points.splice(0, idxMainLoadingPoint + 1) // Удаляю все точки до основного пункта погрузки

    return points
  }

  get completedPoints(): RoutePoint[] {
    return this.route.filter((point) => point.isCompleted)
  }

  get firstArrivalDate() {
    return this.route[0].firstDate
  }

  get lastRouteDate(): Date | null {
    return this.route.reduce((latest: Date | null, point) => {
      if (
        point.lastDate !== null &&
        (latest === null || point.lastDate > latest)
      ) {
        return point.lastDate
      }
      return latest
    }, null)
  }

  get routeDatesFilled() {
    return this.route.every((p) => p.datesFilled)
  }

  get countOfPoints() {
    return this.route.filter((i) => !i.isReturnPoint).length
  }

  get loadingTimesInMinutes(): number[] {
    return this.route
      .filter((i) => i.isLoadingPointType)
      .map((i) => i.getDurationInMinutes)
  }

  get unloadingTimesInMinutes(): number[] {
    return this.route
      .filter((i) => !i.isLoadingPointType)
      .map((i) => i.getDurationInMinutes)
  }

  get returnTimesInMinutes(): number[] {
    return (
      this.route.filter((i) => i.isReturn).map((i) => i.getDurationInMinutes) ??
      []
    )
  }

  tripTimes(unit: UnitType = 'minutes') {
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

  totalDuration(unit: UnitType = 'minutes') {
    const dates = this.route
      .reduce(
        (arr: (Date | null)[], item: RoutePoint) => [
          ...arr,
          item.firstDate,
          item.lastDate,
        ],
        []
      )
      .filter(isDate)
    if (dates.length <= 1) return 0
    const minDate = Math.min(...dates.map((date) => date.getTime()))
    const maxDate = Math.max(...dates.map((date) => date.getTime()))
    return dayjs(maxDate).diff(minDate, unit)
  }

  get orderDate(): Date {
    if (!this.mainLoadingPoint.plannedDate)
      throw new Error('order date is missing! invalid order')
    return this.mainLoadingPoint.plannedDate
  }

  toJSON() {
    return this.route
  }
  toObject() {
    return Object.assign(this.route)
  }
}
