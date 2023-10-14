import { Order } from './order.domain'
import { createEventDefinition } from 'ts-bus'

export enum ORDER_DOMAIN_EVENTS {
  updated = 'order:updated',
  remove = 'order:remove',
  route_updated = 'orders:route_updated',
  deleted = 'order:deleted', // используется для оповещения клиента
}

export const OrdersRouteUpdateEvent = createEventDefinition<Order[]>()(
  ORDER_DOMAIN_EVENTS.route_updated
)

export const OrderRemoveEvent = createEventDefinition<{ orderId: string }>()(
  ORDER_DOMAIN_EVENTS.remove
)

export const OrderUpdatedEvent = createEventDefinition<Order>()(
  ORDER_DOMAIN_EVENTS.updated
)
