import type { IdleTruckNotificationMessage } from '../../../domain/notifications/idleTruckNotificationMessage'
import { toSendIdleTruckNotificationMessageEvent } from '../../../domain/partner/domainEvents'
import { bus } from '../../../eventBus'
import NotificationRepository from '../../../repositories/notification/notification.repository'

export const sendIdleTruckNotificationMessages = async (
  date: Date
): Promise<void> => {
  const messages: IdleTruckNotificationMessage[] =
    await NotificationRepository.getCreatedIdleTruckNotificationMessages(date)

  for (const message of messages) {
    try {
      bus.publish(toSendIdleTruckNotificationMessageEvent(message.body))
      message.send(date)
      await NotificationRepository.updateIdleTruckNotificationMessage(message)
    } catch (e) {
      console.error('Ошибка отправки уведомления:', e)
    }
  }
}
