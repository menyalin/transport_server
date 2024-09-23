import { Order } from '../../order/order.domain'
import { IdleTruckNotification } from '../idleTruckNotification'

export const isNeedCreateNotificationByOrder = (
  notification: IdleTruckNotification,
  order: Order
): boolean => {
  const agreement =
    !notification.agreement ||
    notification.agreement === order.client.agreement?.toString()

  const address = notification.includeAddress(
    order.route.mainLoadingPoint.address
  )

  return agreement && address
}
