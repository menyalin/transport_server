import { RoutePoint } from '@/domain/order/route/routePoint'
import {
  ITemplateRoutePoint,
  TemplateRoutePoint,
} from '@/domain/orderTemplate/templateRoutePoint'

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
