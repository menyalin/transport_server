import { Schema, model } from 'mongoose'
import { IdleTruckNotificationMessage } from '@/domain/notifications/idleTruckNotificationMessage'
const schema = new Schema(IdleTruckNotificationMessage.dbSchema(), {
  timestamps: true,
})

export const IdleTruckNotificationModel = model<IdleTruckNotificationMessage>(
  'IdleTruckNotification',
  schema,
  'idleTruckNotifications'
)
