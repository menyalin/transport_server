import dayjs from 'dayjs'
import { RoutePoint } from '../../../values/order/routePoint'
import { IdleTruckNotification } from '../../partner/idleTruckNotification'

export const getIdleTruckNotificationMessageSendDate = (
  notification: IdleTruckNotification,
  point: RoutePoint
): Date => {
  if (!point.plannedDate && !point.arrivalDate)
    throw new Error(
      'getIdleTruckNotificationMessageSendDate : point dates is missing'
    )

  let date = point.plannedDate || point.arrivalDate

  if (point.arrivalDate && point.plannedDate) {
    date = dayjs(point.arrivalDate).isAfter(point.plannedDate)
      ? point.arrivalDate
      : point.plannedDate
  }

  return dayjs(date).add(notification.idleHoursBeforeNotify, 'hours').toDate()
}
