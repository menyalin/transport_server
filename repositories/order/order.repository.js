import { Order as OrderDomain } from '../../domain/order/order.domain.js'
import { Order as OrderModel } from '../../models/index.js'
import getOrdersByTrucksAndPeriodPipeline from './pipelines/getOrdersByTrucksAndPeriodPipeline.js'

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
    const savedDocs = []
    if (!orders || !Array.isArray(orders))
      throw new Error(
        `OrderRepository : save : expected array of orders, received type:  ${typeof orders}`
      )
    if (!orders.every((o) => o instanceof OrderDomain))
      throw new Error(`OrderRepository : save : expected OrderDomain instance`)

    const orderDocs = await this.model.find({ _id: orders.map((o) => o._id) })
    if (orderDocs.length === 0)
      throw new Error(`OrderRepository : save : orders not found`)

    for (let orderDoc of orderDocs) {
      const updatedOrder = orders.find((i) => i.isEqual(orderDoc._id))
      if (!updatedOrder) continue
      else {
        orderDoc = Object.assign(orderDoc, updatedOrder)
        await orderDoc.save()
        savedDocs.push(orderDoc)
      }
    }
    return savedDocs
  }
}

export default new OrderRepository({ model: OrderModel })
