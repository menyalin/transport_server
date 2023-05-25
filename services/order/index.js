/* eslint-disable comma-dangle */
import mongoose from 'mongoose'
import PriceDTO from '../../dto/price.dto.js'
import {
  Order as OrderModel,
  OrderTemplate as OrderTemplateModel,
} from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import { getSchedulePipeline } from './pipelines/getSchedulePipeline.js'
import { getOrderListPipeline } from './pipelines/getOrderListPipeline.js'
import { ChangeLogService, PermissionService, TariffService } from '../index.js'
import checkCrossItems from './checkCrossItems.js'
import checkRefusedOrder from './checkRefusedOrder.js'
import getRouteFromTemplate from './getRouteFromTemplate.js'
import getClientAgreementId from './getClientAgreement.js'
import getOutsourceAgreementId from './getOutsourceAgreementId.js'
import { orsDirections } from '../../helpers/orsClient.js'
import { BadRequestError } from '../../helpers/errors.js'
import { getDocsRegistryByOrderId } from './getDocsRegistryByOrderId.js'
import { getPaymentInvoicesByOrderIds } from './getPaymentInvoicesByOrderIds.js'

const _isEqualDatesOfRoute = ({ oldRoute, newRoute }) => {
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

class OrderService {
  async create({ body, user }) {
    await PermissionService.checkPeriod({
      userId: user,
      companyId: body.company,
      operation: 'order:daysForWrite',
      startDate: body.route[0].plannedDate,
    })
    
    checkRefusedOrder(body)
    await checkCrossItems({ body })

    if (!body.client.agreement && body.route[0].plannedDate)
      body.client.agreement = await getClientAgreementId(body)

    if (!body.confirmedCrew.outsourceAgreement && body.route[0].plannedDate)
      body.confirmedCrew.outsourceAgreement = await getOutsourceAgreementId(
        body
      )
    if (body.client.agreement && body.analytics.type) {
      body.prePrices = await TariffService.getPrePricesByOrderData(
        PriceDTO.prepareOrderForPrePriceQuery(body)
      )
    }
    const order = await OrderModel.create(body)
    emitTo(order.company.toString(), 'order:created', order.toJSON())
    await ChangeLogService.add({
      docId: order._id.toString(),
      company: order.company.toString(),
      coll: 'order',
      user,
      opType: 'create',
      body: JSON.stringify(order.toObject({ flattenMaps: true })),
    })
    return order
  }

  async createFromTemplate({ body, user }) {
    if (!Array.isArray(body) || body.length === 0)
      throw new BadRequestError('Не верный формат данных')
    const templateIds = body.map((i) => i.template)

    const templates = await OrderTemplateModel.find({
      _id: templateIds,
    }).lean()
    
    for (let i = 0; i < body.length; i++) {
      const template = templates.find(
        (t) => t._id.toString() === body[i].template
      )
      const startDate = body[i].date
      const route = getRouteFromTemplate({ template, date: startDate })
      for (let j = 0; j < body[i].count; j++) {
        const newOrder = {
          client: {
            client: template.client,
          },
          startPositionDate: route[0].plannedDate,
          route,
          analytics: template.analytics,
          company: template.company,
          reqTransport: template.reqTransport,
          confirmedCrew: {
            outsourceAgreement: null,
          },
          cargoParams: template.cargoParams,
          state: {
            status: 'needGet',
          },
        }
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
    if (!truck) {
      order.confirmedCrew.truck = null
      order.confirmedCrew.outsourceAgreement = null
    } else {
      order.confirmedCrew.truck = mongoose.Types.ObjectId(truck)
      order.confirmedCrew.outsourceAgreement = await getOutsourceAgreementId(
        order
      )
    }
    order.confirmedCrew.driver = null
    order.confirmedCrew.trailer = null
    order.confirmedCrew.tkName = null
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
      body: JSON.stringify(order.toJSON()),
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
        endDate,
      })
      const res = await OrderModel.aggregate(pipeline)
      return res
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async deleteById({ id, user }) {
    const order = await OrderModel.findById(id)
    if (order?.state?.status === 'needGet') {
      emitTo(order.company.toString(), 'order:deleted', id)
      await ChangeLogService.add({
        docId: order._id.toString(),
        company: order.company.toString(),
        coll: 'order',
        user,
        opType: 'delete',
        body: JSON.stringify(order.toJSON()),
      })
      await order.remove()
      return order
    } else throw new BadRequestError('Рейс нельзя удалить')
  }

  async getById(id) {
    const allowedStatusesForGetDocsRegistry = ['completed']
    const order = await OrderModel.findById(id).lean()
    if (
      order &&
      allowedStatusesForGetDocsRegistry.includes(order.state.status)
    ) {
      order.docsRegistry = await getDocsRegistryByOrderId(order._id.toString())
      order.paymentInvoices = await getPaymentInvoicesByOrderIds([
        order._id.toString(),
        ...(order.paymentParts?.map((i) => i._id.toString()) || []),
      ])
    }

    return order
  }

  async updateFinalPrices({ orderId, finalPrices, company, user }) {
    const order = await OrderModel.findOne({ _id: orderId, company })
    order.finalPrices = finalPrices
    await order.save()
    emitTo(
      order.company.toString(),
      `order:${orderId}:finalPriceUpdated`,
      order.toJSON()
    )
    await ChangeLogService.add({
      docId: order._id.toString(),
      company: order.company.toString(),
      coll: 'order',
      user,
      opType: 'updateFinalPrices',
      body: JSON.stringify(order.toJSON()),
    })
    return order
  }

  async updateOne({ id, body, user }) {
    checkRefusedOrder(body)
    if (!body.client.agreement && body.route[0].plannedDate)
      body.client.agreement = await getClientAgreementId(body)

    if (body.client.agreement && body.analytics.type) {
      body.prePrices = await TariffService.getPrePricesByOrderData(
        PriceDTO.prepareOrderForPrePriceQuery(body)
      )
    }

    if (!body.confirmedCrew.outsourceAgreement && body.confirmedCrew.truck)
      body.confirmedCrew.outsourceAgreement = await getOutsourceAgreementId(
        body
      )
    let order = await OrderModel.findById(id)
    if (!order) return null
    if (order.company.toString() !== body.company)
      throw new BadRequestError('The order is owned by another company')

    // если в маршруте изменились даты проверяется пересечение с другими записями
    if (body.route) {
      const datesNotChanged = _isEqualDatesOfRoute({
        oldRoute: order.toJSON().route,
        newRoute: body.route,
      })
      if (!datesNotChanged) await checkCrossItems({ body, id })
    }

    // контроль разрешения на редактирвоание выполненного рейса
    if (order.state.status === 'completed')
      await PermissionService.checkPeriod({
        userId: user,
        companyId: body.company,
        operation: 'order:daysForWrite',
        startDate: order.route.reverse()[0].departureDate,
      })

    // если в рейсе есть массив с документами, то заполняю признак получения документов
    if (body.docs && body.docs.length && !body.docsState?.getted) {
      body.docsState = {
        getted: true,
        date: new Date(),
      }
    }

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
      body: JSON.stringify(order.toObject({ flattenMaps: true })),
    })
    return order
  }

  async getDistance({ coords }) {
    try {
      const radiusesArray = []
      coords.forEach((i) => {
        radiusesArray.push(-1)
      })
      const res = await orsDirections.calculate({
        coordinates: coords,
        profile: 'driving-hgv',
        format: 'json',
        units: 'km',
        radiuses: radiusesArray,
      })
      return {
        distanceRoad: Math.round(res.routes[0].summary.distance),
        durationInSec: res.routes[0].summary.duration,
        durationStr: 'TODO',
      }
    } catch (e) {
      return null
    }
  }

  async setDocsState(id, state) {
    const order = await OrderModel.findById(id)
    if (!order) throw new BadRequestError('order not found')
    order.docsState.getted = state
    order.docsState.date = state ? new Date() : null
    await order.save()
    emitTo(order.company.toString(), 'order:updated', order)
    return order
  }

  async setDocs(id, docs) {
    const order = await OrderModel.findById(id)
    if (!order) throw new BadRequestError('order not found')
    order.docs = docs
    if (docs.length && !order?.docsState.getted) {
      order.docsState.getted = true
      order.docsState.date = new Date()
    }
    await order.save()
    emitTo(order.company.toString(), 'order:updated', order)
    return order
  }

  async autoSetRoutesDates(inputData, company) {
    // Получить список рейсов по грузовикам с учетом периода и компании
    

    return inputData.toString()
    // 
  }
}

export default new OrderService()
