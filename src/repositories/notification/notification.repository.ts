import { IdleTruckNotificationMessage } from '../../domain/notifications/idleTruckNotificationMessage'
import { MESSAGE_STATUS_ENUM } from '../../domain/notifications/interfaces'
import { IDLE_TRUCK_NOTIFICATION_EVENTS } from '../../services/notification/events/idleTruckNotifications'
import { IdleTruckNotificationModel } from './models/idleTruckNotificationMessage'

class NotificationRepository {
  async updateIdleTruckNotificationMessage(
    message: IdleTruckNotificationMessage
  ): Promise<void> {
    await IdleTruckNotificationModel.findOneAndUpdate(
      { key: message.key },
      { $set: message },
      { upsert: true, setDefaultsOnInsert: true, new: true }
    )
  }

  async cancelIdleTruckNotificationMessages(
    notificationId: string
  ): Promise<void> {
    await IdleTruckNotificationModel.updateMany(
      {
        notificationId,
        status: MESSAGE_STATUS_ENUM.created,
      },
      {
        status: MESSAGE_STATUS_ENUM.canceled,
      }
    )
  }

  async getByKey(key: string): Promise<IdleTruckNotificationMessage | null> {
    const message = await IdleTruckNotificationModel.findOne({ key }).lean()
    return !!message ? new IdleTruckNotificationMessage(message) : null
  }

  async getByOrderId(orderId: string): Promise<IdleTruckNotificationMessage[]> {
    const docs = await IdleTruckNotificationModel.find({ orderId }).lean()
    return docs.map((i) => new IdleTruckNotificationMessage(i))
  }

  async getCreatedIdleTruckNotificationMessages(
    sendDate: Date
  ): Promise<IdleTruckNotificationMessage[]> {
    const messages = await IdleTruckNotificationModel.find({
      status: MESSAGE_STATUS_ENUM.created,
      sendDate: { $lte: sendDate },
    }).lean()
    return messages.map((i) => new IdleTruckNotificationMessage(i))
  }
}
export default new NotificationRepository()
