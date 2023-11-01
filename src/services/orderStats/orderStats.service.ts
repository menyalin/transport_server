import { bus } from '../../eventBus'
import {
  OrderRemoveEvent,
  OrdersRouteUpdateEvent,
} from '../../domain/order/domainEvents'
import OrderStatsRepository from '../../repositories/order/orderStats.repository'

class OrderStatsService {
  constructor() {
    bus.subscribe(OrdersRouteUpdateEvent, async (e) => {
      await OrderStatsRepository.updateRoutes(e.payload)
    })
    bus.subscribe(OrderRemoveEvent, async (e) => {
      await OrderStatsRepository.removeStats(e.payload.orderId)
    })
  }
}

export default new OrderStatsService()
