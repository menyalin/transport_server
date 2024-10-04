import { Schema, Types } from 'mongoose'
import { RoutePoint } from '../../values/order/routePoint'
import { FullOrderDataDTO } from '../order/dto/fullOrderData.dto'
import { IdleTruckNotification } from '../partner/idleTruckNotification'
import {
  IDefaultIdleTruckNotification,
  IIdleTruckNotificationMessageProps,
  MESSAGE_STATUS_ENUM,
} from './interfaces'

import * as utils from './utils'

const getMessageKey = (
  orderId: string,
  notificationId: string,
  pointId: string
): string => `${orderId} : ${notificationId} : ${pointId}`

const getEmailTitle = (
  orderData: FullOrderDataDTO,
  point: RoutePoint
): string => {
  let waybills = ''
  if (point.waybills) waybills = `, ТТН: ${point.waybills}`

  return (
    `Простой по рейсу: ${orderData.routeAddressesString}, ${orderData.truckNum}, ${orderData.fullDriverName}` +
    waybills
  )
}

export class IdleTruckNotificationMessage {
  _id?: string
  orderId: string
  pointId: string
  notificationId: string
  key: string
  status: MESSAGE_STATUS_ENUM
  body: IDefaultIdleTruckNotification
  sendDate: Date | null
  sended?: Date[]
  createdAt?: Date

  constructor(p: IIdleTruckNotificationMessageProps) {
    if (p._id) this._id = p._id
    this.orderId = p.orderId
    this.pointId = p.pointId
    this.notificationId = p.notificationId
    this.key = p.key
    this.status = p.sendDate !== null ? p.status : MESSAGE_STATUS_ENUM.canceled
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

  delete() {
    this.status = MESSAGE_STATUS_ENUM.deleted
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
    if (!notification._id)
      throw new Error(
        'IdleTruckNotificationMessage : create : Notification ID is missing'
      )

    const key = getMessageKey(
      order._id?.toString(),
      notification._id?.toString() || '',
      point._id?.toString() || ''
    )

    const status = point.isCompleted
      ? MESSAGE_STATUS_ENUM.canceled
      : MESSAGE_STATUS_ENUM.created

    const sendDate = utils.getIdleTruckNotificationMessageSendDate(
      notification,
      point
    )

    const body: IDefaultIdleTruckNotification = {
      to: notification.emails,
      cc: notification.ccEmails || null,
      bcc: notification.bccEmails || null,
      isLoading: point.isLoadingPointType,
      templateName: notification.templateName || 'defaultIdleTruckNotify',
      emailTitle: getEmailTitle(order, point),
      companyName: order.companyName,
      orderNum: order.orderNum || null,
      plannedDate:
        point.plannedDate?.toLocaleString('ru') ||
        point.arrivalDate?.toLocaleString('ru') ||
        'invalid date',
      fullDriverName: order.fullDriverName,
      driverPhones: order.driverPhones,
      routeAddressesString: order.routeAddressesString,
      truckBrand: order.truckBrand,
      truckNum: order.truckNum,
      trailerNum: order.trailerNum,
      currentAddressString: utils.getCurrentAddress(point, order),
      showPointStatus: !!point.arrivalDate,
      waybills: point.waybills || '',
      currentStatus: utils.getCurrentPointStatusString(point),
    }

    return new IdleTruckNotificationMessage({
      orderId: order._id.toString(),
      pointId: point._id.toString(),
      notificationId: notification._id.toString(),
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
      notificationId: Types.ObjectId,
      key: { type: String, unique: true },
      status: { type: String, required: true },
      body: Schema.Types.Mixed,
      sendDate: { type: Date, required: true },
      sended: [{ type: Date }],
    }
  }
}
