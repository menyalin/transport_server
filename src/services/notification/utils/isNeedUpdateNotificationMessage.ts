import { IdleTruckNotificationMessage } from '../../../domain/notifications/idleTruckNotificationMessage'
import { MESSAGE_STATUS_ENUM } from '../../../domain/notifications/interfaces'

export const isNeedUpdateNotificationMessage = (
  newMessage: IdleTruckNotificationMessage,
  existedMessage: IdleTruckNotificationMessage | null
): boolean => {
  if (!existedMessage) return true
  if (!existedMessage.sendDate || !newMessage.sendDate) return true
  if (
    existedMessage.status === MESSAGE_STATUS_ENUM.created ||
    existedMessage.status === MESSAGE_STATUS_ENUM.deleted
  )
    return true

  if (
    existedMessage.status === MESSAGE_STATUS_ENUM.sended &&
    newMessage.status === MESSAGE_STATUS_ENUM.canceled
  )
    return false

  if (
    existedMessage.status !== newMessage.status &&
    +existedMessage.sendDate !== +newMessage.sendDate
  )
    return true

  return false
}
