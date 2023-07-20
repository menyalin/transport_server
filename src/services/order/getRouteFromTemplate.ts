import { RoutePoint } from '../../values/order/routePoint'
import {
  ITemplateRoutePoint,
  TemplateRoutePoint,
} from '../../values/order/templateRoutePoint'

const getRouteFromTemplate = ({ template, date }: any): RoutePoint[] => {
  return template.route.map((point: ITemplateRoutePoint, idx: number) =>
    RoutePoint.createFromTemplatePoint(
      new TemplateRoutePoint(point),
      new Date(date),
      idx === 0
    )
  )
}

export default getRouteFromTemplate
