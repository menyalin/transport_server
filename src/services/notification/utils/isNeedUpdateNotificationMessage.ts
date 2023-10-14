import { IdleTruckNotificationMessage } from '../../../domain/notifications/idleTruckNotificationMessage'
import { MESSAGE_STATUS_ENUM } from '../../../domain/notifications/interfaces'

export const isNeedUpdateNotificationMessage = (
  newMessage: IdleTruckNotificationMessage,
  existedMessage: IdleTruckNotificationMessage | null
): boolean => {
  if (!existedMessage) return true

  if (existedMessage.status === MESSAGE_STATUS_ENUM.created) return true

  if (
    existedMessage.status === MESSAGE_STATUS_ENUM.sended &&
    newMessage.status === MESSAGE_STATUS_ENUM.canceled
  )
    return false

  if (
    existedMessage.status !== newMessage.status &&
    existedMessage.sendDate.valueOf() !== newMessage.sendDate.valueOf()
  )
    return true

  return false
}
