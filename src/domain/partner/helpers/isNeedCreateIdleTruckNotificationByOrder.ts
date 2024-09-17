import { Order } from '../../order/order.domain'
import { IdleTruckNotification } from '../idleTruckNotification'

export const isNeedCreateNotificationByOrder = (
  notification: IdleTruckNotification,
  order: Order
): boolean => {
  // TODO: remove this
  // if (
  //   !order.confirmedCrew?.truck ||
  //   (notification.useTruckFilter === USE_TRUCK_FILTER_ENUM.included &&
  //     !notification.trucks.includes(order.confirmedCrew.truck.toString()))
  // )
  //   return false

  // if (
  //   notification.useTruckFilter === USE_TRUCK_FILTER_ENUM.excluded &&
  //   notification.trucks.includes(order.confirmedCrew.truck.toString())
  // )
  //   return false

  if (notification.addresses?.includes(order.route.mainLoadingPoint.address))
    return true

  return false
}
