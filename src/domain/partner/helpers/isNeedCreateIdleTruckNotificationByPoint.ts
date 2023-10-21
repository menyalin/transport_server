import { RoutePoint } from '../../../values/order/routePoint'
import { IdleTruckNotification } from '../idleTruckNotification'

export const isNeedCreateNotificationByPoint = (
  notification: IdleTruckNotification,
  point: RoutePoint
): boolean => {
  if (!point.plannedDate) return false
  if (notification.usePlannedDate && point.plannedDate) return true
  if (point.isStarted) return true
  return false
}
