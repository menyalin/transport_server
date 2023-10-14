import { IdleTruckNotificationMessage } from '../../../domain/notifications/idleTruckNotificationMessage'
import { toSendIdleTruckNotificationMessageEvent } from '../../../domain/partner/domainEvents'
import { bus } from '../../../eventBus'
import NotificationRepository from '../../../repositories/notification/notification.repository'

export const sendIdleTruckNotificationMessages = async (
  date: Date
): Promise<void> => {
  const messages =
    await NotificationRepository.getCreatedIdleTruckNotificationMessages(date)

  messages.forEach(async (message: IdleTruckNotificationMessage) => {
    bus.publish(toSendIdleTruckNotificationMessageEvent(message.body))
    message.send(date)
    await NotificationRepository.updateIdleTruckNotificationMessage(message)
  })
}
