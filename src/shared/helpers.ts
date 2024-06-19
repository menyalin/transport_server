import { Route } from '@/values/order/route'

const isEqualDatesOfRoute = (oldRoute: Route, newRoute: Route) => {
  if (!(oldRoute instanceof Route) || !(newRoute instanceof Route))
    throw new Error(' _isEqualDatesOfRoute : is invalid route')
  return oldRoute.totalDuration('minutes') === newRoute.totalDuration('minutes')
}

export { isEqualDatesOfRoute }
