import { RoutePoint } from '@/domain/order/route/routePoint'
import { IdleTruckNotification } from '../idleTruckNotification'

export const isNeedCreateNotification = (
  notification: IdleTruckNotification,
  point: RoutePoint
): boolean => {
  if (!notification.includeAddress(point.address)) return false
  if (notification.usePlannedDate && point.plannedDate) return true
  if (!!point.plannedDate && point.isStarted) return true
  return false
}
