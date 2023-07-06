// @ts-nocheck
import OrderStatsRepository from './orderStats.repository'
import { Order as OrderDomain } from '../../domain/order/order.domain'
import { EventBus, Events } from '../../eventBus'
import { Order as OrderModel } from '../../models'
import getOrdersByTrucksAndPeriodPipeline from './pipelines/getOrdersByTrucksAndPeriodPipeline'

class OrderRepository {
  constructor({ model }) {
    this.model = model
  }

  async getOrdersByTrucksAndPeriod(params) {
    const orders = await this.model.aggregate(
      getOrdersByTrucksAndPeriodPipeline(params)
    )
    return orders.map((order) => new OrderDomain(order))
  }

  async save(orders) {
    const makeOperation = (filter, update) => ({
      updateOne: { filter, update, upsert: false },
    })

    if (!orders || !Array.isArray(orders))
      throw new Error(
        `OrderRepository : save : expected array of orders, received type:  ${typeof orders}`
      )
    if (!orders.every((o) => o instanceof OrderDomain))
      throw new Error(`OrderRepository : save : expected OrderDomain instance`)

    const operations = orders.map((order) =>
      makeOperation(
        { _id: order.id },
        { ...order, route: order.route.toJSON() }
      )
    )
    await this.model.bulkWrite(operations)
    EventBus.emitEvent(Events.ORDERS_ROUTE_UPDATED, orders)
    return
  }
}

export default new OrderRepository({ model: OrderModel })
