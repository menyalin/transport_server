import { createEventDefinition } from 'ts-bus'
import { Order } from '../../../domain/order/order.domain'
import { IdleTruckNotification } from '../../../domain/partner/idleTruckNotification'
import { RoutePoint } from '../../../values/order/routePoint'

export enum IDLE_TRUCK_NOTIFICATION_EVENTS {
  toCreate = 'idleTruckNotification:toCreate',
}

export const toCreateIdleTruckNotificationEvent = createEventDefinition<{
  order: Order
  notification: IdleTruckNotification
  point: RoutePoint
}>()(IDLE_TRUCK_NOTIFICATION_EVENTS.toCreate)
