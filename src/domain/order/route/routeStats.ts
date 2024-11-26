import { Route } from './route'

export class RouteStats {
  countPoints: number
  loadingTimesInMinutes: number[]
  unloadingTimesInMinutes: number[]
  returnTimesInMinutes: number[]
  tripTimesInMinutes: number[]
  totalDurationInMinutes: number

  constructor(route: Route) {
    if (!route || !(route instanceof Route))
      throw new Error('RouteStats : constructor : invalid route!')
    this.countPoints = route.countOfPoints
    this.loadingTimesInMinutes = route.loadingTimesInMinutes
    this.unloadingTimesInMinutes = route.unloadingTimesInMinutes
    this.returnTimesInMinutes = route.returnTimesInMinutes
    this.tripTimesInMinutes = route.tripTimes('minutes')
    this.totalDurationInMinutes = route.totalDuration('minutes')
  }

  static get dbSchema() {
    return {
      countPoints: Number,
      loadingTimesInMinutes: [Number],
      unloadingTimesInMinutes: [Number],
      returnTimesInMinutes: [Number],
      tripTimesInMinutes: [Number],
      totalDurationInMinutes: Number,
    }
  }
}
