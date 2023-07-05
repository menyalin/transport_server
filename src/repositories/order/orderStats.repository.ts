// @ts-nocheck
import { Order as OrderDomain } from '../../domain/order/order.domain.js'
import { EventBus, Events } from '../../eventBus/index.js'
import { OrderStats as OrderStatsModel } from '../../models/index.js'

import { RouteStats } from '../../values/order/routeStats.js'

class OrderStatsRepository {
  constructor() {
    EventBus.subscribe(Events.ORDERS_ROUTE_UPDATED, this.updateRoutes)
  }
  static validateOrders(orders, method = '') {
    if (!orders || !Array.isArray(orders))
      throw new Error(
        `OrderStatsRepository : ${method} : orders array is missing`
      )
    if (orders.some((o) => !(o instanceof OrderDomain)))
      throw new Error(`OrderStatsRepository : ${method} : invalid orders type`)
  }

  async updateRoutes(orders) {
    OrderStatsRepository.validateOrders(orders, 'updateRoutes')
    if (orders.length === 0) return
    const makeOperation = (filter, update) => ({
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
