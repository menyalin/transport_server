import mongoose from 'mongoose'
import { Order as OrderModel } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'

class OrderService {
  async create(orderBody) {
    const res = await OrderModel.create(orderBody)
    return res
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
    emitTo(order.company.toString(), 'order:updated', order)
    await order.save()
  }

  async getList({ company }) {
    const res = await OrderModel.find({ company }).lean()
    return res
  }

  // async getSchedule({ company }) {
  //   const pipeline = getSchedulePipeline({ company })
  //   const res = await OrderModel.aggregate(pipeline)
  //   return res
  // }

  delete() {}

  getById(id) {}
}

export default new OrderService()
