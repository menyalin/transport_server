import {
  ORDER_DOMAIN_EVENTS,
  OrderRemoveEvent,
  OrdersRouteUpdateEvent,
} from '../../domain/order/domainEvents'
import { Order as OrderDomain } from '../../domain/order/order.domain'
import { bus } from '../../eventBus'
import { OrderStats as OrderStatsModel } from '../../models'

import { RouteStats } from '../../values/order/routeStats'

class OrderStatsRepository {
  constructor() {
    bus.subscribe(OrdersRouteUpdateEvent, (e) => {
      try {
        this.updateRoutes(e.payload)
      } catch (e) {
        console.log(' order route update subscription error: ', e)
      }
    })
    bus.subscribe(OrderRemoveEvent, (e) => {
      try {
        this.removeStats(e.payload.orderId)
      } catch (e) {
        console.log(' order remove subscription error: ', e)
      }
    })
  }

  static validateOrders(orders: OrderDomain[], method = '') {
    if (!orders || !Array.isArray(orders))
      throw new Error(
        `OrderStatsRepository : ${method} : orders array is missing`
      )
    if (orders.some((o) => !(o instanceof OrderDomain)))
      throw new Error(`OrderStatsRepository : ${method} : invalid orders type`)
  }

  async removeStats(orderId: string) {
    const res = await OrderStatsModel.findOneAndDelete({ orderId })
    return res
  }

  async updateRoutes(orders: OrderDomain[]) {
    OrderStatsRepository.validateOrders(orders, 'updateRoutes')
    if (orders.length === 0) return
    const makeOperation = (filter: object, update: object) => ({
      updateOne: { filter, update, upsert: true },
    })
    const operations = orders.map((order) =>
      makeOperation(
        { orderId: order.id },
        {
          orderId: order.id,
          orderDate: order.orderDate,
          company: order.company,
          route: new RouteStats(order.route),
        }
      )
    )
    await OrderStatsModel.bulkWrite(operations)
  }
}

export default new OrderStatsRepository()
