import { Order } from '@/domain/order/order.domain'
import { RoutePoint } from '@/domain/order/route/routePoint'
import { IdleTruckNotification } from '@/domain/partner/idleTruckNotification'
import { createEventDefinition } from 'ts-bus'

export enum IDLE_TRUCK_NOTIFICATION_EVENTS {
  toCreate = 'idleTruckNotification:toCreate',
}

export const toCreateIdleTruckNotificationEvent = createEventDefinition<{
  order: Order
  notification: IdleTruckNotification
  point: RoutePoint
}>()(IDLE_TRUCK_NOTIFICATION_EVENTS.toCreate)
