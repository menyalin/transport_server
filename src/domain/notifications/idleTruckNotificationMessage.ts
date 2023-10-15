import { Schema, Types } from 'mongoose'
import dayjs from 'dayjs'
import { RoutePoint } from '../../values/order/routePoint'
import { FullOrderDataDTO } from '../order/dto/fullOrderData.dto'
import { IdleTruckNotification } from '../partner/idleTruckNotification'
import {
  IDefaultIdleTruckNotification,
  IIdleTruckNotificationMessageProps,
  MESSAGE_STATUS_ENUM,
} from './interfaces'

const getMessageKey = (
  orderId: string,
  notificationId: string,
  pointId: string
): string => `${orderId} : ${notificationId} : ${pointId}`

const getEmailTitle = (orderData: FullOrderDataDTO): string => {
  return `Простой по рейсу: ${orderData.routeAddressesString}, ${orderData.truckNum}, ${orderData.fullDriverName}`
}

export class IdleTruckNotificationMessage {
  _id?: string
  orderId: string
  pointId: string
  key: string
  status: MESSAGE_STATUS_ENUM
  body: IDefaultIdleTruckNotification
  sendDate: Date
  sended?: Date[]
  createdAt?: Date

  constructor(p: IIdleTruckNotificationMessageProps) {
    if (p._id) this._id = p._id
    this.orderId = p.orderId
    this.pointId = p.pointId
    this.key = p.key
    this.status = p.status
    this.body = p.body
    this.sendDate = p.sendDate
    this.sended = p.sended
    this.createdAt = p.createdAt
  }

  send(date: Date) {
    this.status = MESSAGE_STATUS_ENUM.sended
    if (!this.sended) this.sended = [date]
    else this.sended.push(date)
  }

  cancel() {
    this.status = MESSAGE_STATUS_ENUM.canceled
  }

  static create(
    order: FullOrderDataDTO,
    notification: IdleTruckNotification,
    point: RoutePoint
  ): IdleTruckNotificationMessage {
    if (!point._id)
      throw new Error(
        'IdleTruckNotificationMessage : create : Point ID is missing'
      )
    if (!point.plannedDate)
      throw new Error(
        'IdleTruckNotificationMessage : create : Point plannedDate is missing'
      )
    const key = getMessageKey(
      order._id?.toString(),
      notification._id?.toString() || '',
      point._id?.toString() || ''
    )

    const status = point.isCompleted
      ? MESSAGE_STATUS_ENUM.canceled
      : MESSAGE_STATUS_ENUM.created

    const sendDate = dayjs(
      notification.usePlannedDate ? point.plannedDate : point.arrivalDate
    )
      .add(+notification.idleHoursBeforeNotify, 'hours')
      .toDate()

    const body: IDefaultIdleTruckNotification = {
      to: notification.emails,
      cc: notification.ccEmails || null,
      isLoading: point.isLoadingPointType,
      templateName: notification.templateName || 'defaultIdleTruckNotify',
      emailTitle: getEmailTitle(order),
      companyName: order.companyName,
      orderNum: order.orderNum || null,
      plannedDate: point.plannedDate?.toLocaleString('ru'),
      fullDriverName: order.fullDriverName,
      driverPhones: order.driverPhones,
      routeAddressesString: order.routeAddressesString,
      truckBrand: order.truckBrand,
      truckNum: order.truckNum,
      trailerNum: order.trailerNum,
    }
    return new IdleTruckNotificationMessage({
      orderId: order._id.toString(),
      pointId: point._id.toString(),
      key,
      status,
      body,
      sendDate,
    })
  }
  static dbSchema() {
    return {
      orderId: Types.ObjectId,
      pointId: Types.ObjectId,
      key: { type: String, unique: true },
      status: { type: String, required: true },
      body: Schema.Types.Mixed,
      sendDate: { type: Date, required: true },
      sended: [Date],
    }
  }
}
