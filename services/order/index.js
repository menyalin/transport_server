import mongoose from 'mongoose'
import { Order as OrderModel } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import { getSchedulePipeline } from './pipelines/getSchedulePipeline.js'
import { getOrderListPipeline } from './pipelines/getOrderListPipeline.js'
import { ChangeLogService } from '../index.js'
import checkCrossItems from './checkCrossItems.js'

class OrderService {
  async create({ body, user }) {
    await checkCrossItems({ body })
    const order = await OrderModel.create(body)
    emitTo(order.company.toString(), 'order:created', order.toJSON())
    await ChangeLogService.add({
      docId: order._id.toString(),
      company: order.company.toString(),
      coll: 'order',
      user,
      opType: 'create',
      body: JSON.stringify(order.toObject({ flattenMaps: true }))
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

  async updateOne({ id, body, user }) {
    let order = await OrderModel.findById(id)
    if (!order) return null
    
    const datesChanged = !(
      new Date(order.route[0].arrivalDate) ===
        new Date(body.route[0].arrivalDate) &&
      new Date(order.route[order.route.length - 1].departureDate) ===
        new Date(body.route[body.route.length - 1].departureDate)
    )
    if (datesChanged) await checkCrossItems({ body, id })

    order = Object.assign(order, { ...body, manager: user })
    await order.save()

    emitTo(order.company.toString(), 'order:updated', order.toJSON())
    await ChangeLogService.add({
      docId: order._id.toString(),
      company: order.company.toString(),
      coll: 'order',
      user,
      opType: 'update',
      body: JSON.stringify(order.toObject({ flattenMaps: true }))
    })
    return order
  }
}

export default new OrderService()
