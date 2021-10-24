import mongoose from 'mongoose'
import { Order as OrderModel } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'

class OrderService {
  async create(orderBody) {
    const order = await OrderModel.create(orderBody)
    emitTo(order.company.toString(), 'order:created', order.toJSON())
    return order
  }

  async disableOrder({ orderId, state }) {
    const order = await OrderModel.findById(orderId)
    order.isDisabled = state
    emitTo(order.company.toString(), 'order:updated', order)
    await order.save()
  }

  async moveOrderInSchedule({
    orderId,
    truck,
    startPositionDate,
    endPositionDate
  }) {
    const order = await OrderModel.findById(orderId)
    order.truck = mongoose.Types.ObjectId(truck)
    order.startPositionDate = startPositionDate
    order.endPositionDate = endPositionDate
    order.isDisabled = false
    emitTo(order.company.toString(), 'order:updated', order)
    await order.save()
  }

  async getList({ company }) {
    const res = await OrderModel.find({ company }).lean()
    return res
  }

  async deleteById(id) {
    const data = await OrderModel.findByIdAndDelete(id)
    emitTo(data.company.toString(), 'order:deleted', id)
    return data
  }

  async getById(id) {
    const res = await OrderModel.findById(id)
    return res
  }

  async updateOne(id, body, userId) {
    let order = await OrderModel.findById(id)
    if (!order) return null
    order = Object.assign(order, { ...body, manager: userId })
    await order.save()
    // await order.populate(['tkName', 'driver', 'manager'])
    emitTo(order.company.toString(), 'order:updated', order.toJSON())
    return order.toJSON()
  }
}

export default new OrderService()
