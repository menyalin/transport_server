import dayjs from 'dayjs'
import { IdleTruckNotification } from '../../partner/idleTruckNotification'
import { RoutePoint } from '@/domain/order/route/routePoint'

export const getIdleTruckNotificationMessageSendDate = (
  notification: IdleTruckNotification,
  point: RoutePoint
): Date | null => {
  const addHours = (date: Date, hours: number): Date => {
    return dayjs(date).add(hours, 'hours').toDate()
  }
  const hours = notification.idleHoursBeforeNotify

  if (notification.usePlannedDate && point.plannedDate)
    return addHours(point.plannedDate, hours)

  if (!notification.usePlannedDate && point.plannedDate && point.arrivalDate)
    return dayjs(point.arrivalDate).isAfter(point.plannedDate)
      ? addHours(point.arrivalDate, hours)
      : addHours(point.plannedDate, hours)

  if (!point.plannedDate && point.arrivalDate)
    return addHours(point.arrivalDate, hours)

  return null
}
