import mongoose from 'mongoose'
import { Order as OrderModel, OrderTemplate } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import { getSchedulePipeline } from './pipelines/getSchedulePipeline.js'
import { getOrderListPipeline } from './pipelines/getOrderListPipeline.js'
import { ChangeLogService } from '../index.js'
import checkCrossItems from './checkCrossItems.js'
import { BadRequestError } from '../../helpers/errors.js'

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

  async createFromTemplate({ body, user }) {
    if (!Array.isArray(body) || body.length === 0)
      throw new BadRequestError('Не верный формат данных')
    const templateIds = body.map((i) => i.template)
    const templates = await OrderTemplate.find({ _id: templateIds }).lean()
    for (let i = 0; i < body.length; i++) {
      const template = templates.find(
        (t) => t._id.toString() === body[i].template
      )
      const startDate = body[i].date
      for (let j = 0; j < body[i].count; j++) {
        const newOrder = {
          client: {
            client: template.client
          },
          startPositionDate: startDate,
          route: template.route,
          company: template.company,
          reqTransport: template.reqTransport,
          cargoParams: template.cargoParams,
          state: {
            status: 'needGet'
          }
        }
        newOrder.route[0].plannedDate = startDate
        await this.create({ body: newOrder, user })
      }
    }
    return { message: 'created' }
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

  _isEqualDatesOfRoute({ oldRoute, newRoute }) {
    const oldArrivalDate = new Date(oldRoute[0].arrivalDate).toLocaleString()
    const newArrivalDate = new Date(newRoute[0].arrivalDate).toLocaleString()
    const oldDepartureDate = new Date(
      oldRoute[oldRoute.length - 1].departureDate
    ).toLocaleString()

    const newDepartureDate = new Date(
      newRoute[newRoute.length - 1].departureDate
    ).toLocaleString()
    return (
      oldArrivalDate === newArrivalDate && oldDepartureDate === newDepartureDate
    )
  }

  async updateOne({ id, body, user }) {
    let order = await OrderModel.findById(id)
    if (!order) return null

    const datesNotChanged = this._isEqualDatesOfRoute({
      oldRoute: order.toJSON().route,
      newRoute: body.route
    })

    if (!datesNotChanged) await checkCrossItems({ body, id })

    order = Object.assign(order, { ...body, manager: user })
    order.isDisabled = false
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
