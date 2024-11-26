import { RoutePoint } from '@/domain/order/route/routePoint'
import { IdleTruckNotification } from '../idleTruckNotification'

export const isNeedCreateNotificationByPoint = (
  notification: IdleTruckNotification,
  point: RoutePoint
): boolean => {
  if (point.isStarted) return true
  if (notification.usePlannedDate && point.plannedDate) return true
  return false
}
