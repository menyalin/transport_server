import './orderStats.repository'

import {
  IOrderDTO,
  Order as OrderDomain,
} from '../../domain/order/order.domain'
import { bus } from '../../eventBus'
import { Order as OrderModel } from '../../models'
import {
  getOrdersByTrucksAndPeriodPipeline,
  IGetOrdersByTrucksAndPeriodPipelineProps,
} from './pipelines/getOrdersByTrucksAndPeriodPipeline'
import {
  OrderRemoveEvent,
  OrdersRouteUpdateEvent,
} from '../../domain/order/domainEvents'

class OrderRepository {
  constructor() {
    bus.subscribe(OrderRemoveEvent, (e) => {
      try {
        this.removeById(e.payload)
      } catch (e) {
        console.log(' order remove subscription error: ', e)
      }
    })
  }

  async getById(orderId: string): Promise<OrderDomain> {
    const order = await OrderModel.findById<IOrderDTO>(orderId)
    if (!order) throw new Error(`${orderId} not found`)
    return new OrderDomain(order)
  }

  async getOrdersByTrucksAndPeriod(
    params: IGetOrdersByTrucksAndPeriodPipelineProps
  ): Promise<OrderDomain[]> {
    const orders = await OrderModel.aggregate(
      getOrdersByTrucksAndPeriodPipeline(params)
    )
    return orders.map((order) => new OrderDomain(order))
  }

  async save(orders: OrderDomain[]) {
    const makeOperation = (filter: object, update: object) => ({
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
    await OrderModel.bulkWrite(operations)
    bus.publish(OrdersRouteUpdateEvent(orders))
    return
  }

  async removeById({ orderId }: { orderId: string }): Promise<boolean> {
    await OrderModel.findByIdAndDelete(orderId)
    return true
  }
}

export default new OrderRepository()
