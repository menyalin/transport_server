import { IdleTruckNotification } from '../idleTruckNotification'

export const setIdleTruckNotifications = (
  notifications: IdleTruckNotification[] | undefined
): IdleTruckNotification[] => {
  if (!notifications || !Array.isArray(notifications)) return []
  if (notifications.every((i) => i instanceof IdleTruckNotification))
    return notifications

  return notifications.map((n) => {
    return new IdleTruckNotification(n)
  })
}
