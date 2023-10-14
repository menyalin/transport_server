import { IdleTruckNotificationMessage } from '../../domain/notifications/idleTruckNotificationMessage'
import { MESSAGE_STATUS_ENUM } from '../../domain/notifications/interfaces'
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

  async getByKey(key: string): Promise<IdleTruckNotificationMessage | null> {
    const message = await IdleTruckNotificationModel.findOne({ key }).lean()
    return !!message ? new IdleTruckNotificationMessage(message) : null
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
