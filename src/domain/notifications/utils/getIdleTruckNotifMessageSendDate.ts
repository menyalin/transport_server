import dayjs from 'dayjs'
import { RoutePoint } from '../../../values/order/routePoint'
import { IdleTruckNotification } from '../../partner/idleTruckNotification'

export const getIdleTruckNotificationMessageSendDate = (
  notification: IdleTruckNotification,
  point: RoutePoint
): Date => {
  if (!point.plannedDate)
    throw new Error(
      'getIdleTruckNotificationMessageSendDate : point planned date is missing'
    )
  let date: Date
  if (!point.arrivalDate) date = point.plannedDate
  else
    date =
      point.arrivalDate?.valueOf() > point.plannedDate?.valueOf()
        ? point.arrivalDate
        : point.plannedDate

  return dayjs(date).add(notification.idleHoursBeforeNotify, 'hours').toDate()
}
