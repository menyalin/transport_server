import dayjs from 'dayjs'
import { RoutePoint } from './routePoint.js'

export class RouteStats {
  static getDbSchema() {
    return {
      countPoints: Number,
      loadingTimesInMinutes: [Number],
      unloadingTimesInMinutes: [Number],
      tripTimesInMinutes: [Number],
      totalDurationInMinutes: Number,
    }
  }

  static getTripTimes(route, unit = 'minutes') {
    const res = []
    for (let i = 1; i < route.length; i++) {
      const prev = route[i - 1]
      const current = route[i]
      if (prev.datesFilled && !!current.firstDate)
        res.push(dayjs(current.firstDate).diff(dayjs(prev.lastDate), unit))
      else res.push(0)
    }
    return res
  }

  static getDuration(route, unit = 'minutes') {
    const dates = route
      .reduce((arr, item) => [...arr, item.firstDate, item.lastDate], [])
      .filter((i) => !!i)
    if (dates.length <= 1) return 0
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    return dayjs(maxDate).diff(minDate, unit)
  }
  // TODO: Переписать с учетом того что Route это объект-значение
  constructor(route) {
    if (!route || route.length === 0)
      throw new Error('RouteStats : constructor : route is missing!')
    if (route.some((i) => !i instanceof RoutePoint))
      throw new Error('RouteStats : constructor : route is missing!')

    this.countPoints = route.filter((i) => !i.isReturnPoint).length

    this.loadingTimesInMinutes = route
      .filter((i) => i.isLoadingPointType)
      .map((i) => i.getDurationInMinutes)

    this.unloadingTimesInMinutes = route
      .filter((i) => !i.isLoadingPointType)
      .map((i) => i.getDurationInMinutes)

    this.tripTimesInMinutes = RouteStats.getTripTimes(route)
    this.totalDurationInMinutes = RouteStats.getDuration(route)
  }

  static getDbSchema() {
    return {
      countPoints: Number,
      loadingTimesInMinutes: [Number],
      unloadingTimesInMinutes: [Number],
      tripTimesInMinutes: [Number],
      totalDurationInMinutes: Number,
    }
  }
}
