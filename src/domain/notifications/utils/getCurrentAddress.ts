import { RoutePoint } from '@/domain/order/route/routePoint'
import { FullOrderDataDTO } from '../../order/dto/fullOrderData.dto'

export const getCurrentAddress = (
  point: RoutePoint,
  order: FullOrderDataDTO
): string => {
  const address = order.addresses.find(
    (i) => i._id.toString() === point.address?.toString()
  )
  return address?.name || ''
}
