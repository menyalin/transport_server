import mongoose from 'mongoose'
import { Order as OrderModel } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import { getSchedulePipeline } from './pipelines/getSchedulePipeline.js'
import { getOrderListPipeline } from './pipelines/getOrderListPipeline.js'
import { ChangeLogService } from '../index.js'

class OrderService {
  async create({ body, user }) {
    const order = await OrderModel.create(body)
    emitTo(order.company.toString(), 'order:created', order.toJSON())
    await ChangeLogService.add({
      docId: order._id.toString(),
      company: order.company.toString(),
      coll: 'order',
      user,
      opType: 'create',
      body: JSON.stringify(order.toJSON())
    })
    return order
  }

  async disableOrder({ orderId, state }) {
    const order = await OrderModel.findById(orderId)
    order.isDisabled = state
    emitTo(order.company.toString(), 'order:updated', order)
    await order.save()
  }

  async moveOrderInSchedule({ orderId, truck, startPositionDate }, user) {
    const order = await OrderModel.findById(orderId)
    if (!truck) order.confirmedCrew.truck = null
    else order.confirmedCrew.truck = mongoose.Types.ObjectId(truck)
    order.startPositionDate = startPositionDate
    order.isDisabled = false
    emitTo(order.company.toString(), 'order:updated', order)
    await order.save()
    await ChangeLogService.add({
      docId: order._id.toString(),
      company: order.company.toString(),
      coll: 'order',
      user,
      opType: 'move order',
      body: JSON.stringify(order.toJSON())
    })
  }

  async getList(params) {
    try {
      const pipeline = getOrderListPipeline(params)
      const res = await OrderModel.aggregate(pipeline)
      return res[0]
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async getListForSchedule({ profile, startDate, endDate }) {
    try {
      const pipeline = getSchedulePipeline({
        company: profile,
        startDate,
        endDate
      })
      const res = await OrderModel.aggregate(pipeline)
      return res
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async deleteById({ id, user }) {
    const data = await OrderModel.findByIdAndDelete(id)
    emitTo(data.company.toString(), 'order:deleted', id)
    await ChangeLogService.add({
      docId: data._id.toString(),
      company: data.company.toString(),
      coll: 'order',
      user,
      opType: 'delete',
      body: JSON.stringify(data.toJSON())
    })
    return data
  }

  async getById(id) {
    const res = await OrderModel.findById(id).lean()
    return res
  }

  async updateOne(id, body, userId) {
    let order = await OrderModel.findById(id)
    if (!order) return null
    order = Object.assign(order, { ...body, manager: userId })
    await order.save()

    emitTo(order.company.toString(), 'order:updated', order.toJSON())
    await ChangeLogService.add({
      docId: order._id.toString(),
      company: order.company.toString(),
      coll: 'order',
      user: userId,
      opType: 'update',
      body: JSON.stringify(order.toJSON())
    })
    return order.toJSON()
  }
}

export default new OrderService()
