import { Order } from '../../order/order.domain'
import { IdleTruckNotification } from '../idleTruckNotification'
import { USE_TRUCK_FILTER_ENUM } from '../interfaces'

export const isNeedCreateNotificationByOrder = (
  notification: IdleTruckNotification,
  order: Order
): boolean => {
  if (
    notification.useTruckFilter === USE_TRUCK_FILTER_ENUM.included &&
    !notification.trucks.includes(order.confirmedCrew.truck)
  )
    return false

  if (
    notification.useTruckFilter === USE_TRUCK_FILTER_ENUM.excluded &&
    notification.trucks.includes(order.confirmedCrew.truck)
  )
    return false

  if (notification.addresses?.includes(order.route.mainLoadingPoint.address))
    return true

  return false
}
