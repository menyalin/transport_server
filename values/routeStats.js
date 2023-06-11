
import { Route } from './route.js'

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

  // TODO: Переписать с учетом того что Route это объект-значение
  constructor(route) {
    if (!route || !route instanceof Route)
      throw new Error('RouteStats : constructor : invalid route!')

    this.countPoints = route.countOfPoints

    this.loadingTimesInMinutes = route.loadingTimesInMinutes

    this.unloadingTimesInMinutes = route.unloadingTimesInMinutes

    this.tripTimesInMinutes = route.tripTimes('minutes')
    this.totalDurationInMinutes = route.totalDuration('minutes')
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
