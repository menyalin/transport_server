import { Order } from './order.domain'
import { createEventDefinition } from 'ts-bus'

export enum ORDER_DOMAIN_EVENTS {
  updated = 'order:updated',
  remove = 'order:remove',
  route_updated = 'orders:route_updated',
  truck_changed = 'order:truck_changed',
  returned_from_in_progress_status = 'order:returned_from_in_progress_status',
  deleted = 'order:deleted',
}

export const OrdersRouteUpdateEvent = createEventDefinition<Order[]>()(
  ORDER_DOMAIN_EVENTS.route_updated
)

export const OrderRemoveEvent = createEventDefinition<{ orderId: string }>()(
  ORDER_DOMAIN_EVENTS.remove
)

export const OrdersUpdatedEvent = createEventDefinition<Order[]>()(
  ORDER_DOMAIN_EVENTS.updated
)

export const OrderTruckChanged = createEventDefinition<{ orderId: string }>()(
  ORDER_DOMAIN_EVENTS.truck_changed
)

export const OrderReturnedFromInProgressStatus = createEventDefinition<{
  orderId: string
}>()(ORDER_DOMAIN_EVENTS.returned_from_in_progress_status)
