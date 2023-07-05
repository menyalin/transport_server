import { Route } from './route'

export class RouteStats {
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
