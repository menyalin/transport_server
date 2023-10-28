import { RoutePoint } from '../../../values/order/routePoint'
import { IdleTruckNotification } from '../idleTruckNotification'

export const isNeedCreateNotificationByPoint = (
  notification: IdleTruckNotification,
  point: RoutePoint
): boolean => {
  if (point.isStarted) return true
  if (notification.usePlannedDate && point.plannedDate) return true
  return false
}
