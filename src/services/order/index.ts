// @ts-nocheck
/* eslint-disable comma-dangle */
import mongoose from 'mongoose'
import PriceDTO from '../../dto/price.dto'
import {
  Order as OrderModel,
  OrderTemplate as OrderTemplateModel,
} from '../../models'
import { emitTo } from '../../socket'
import { getSchedulePipeline } from './pipelines/getSchedulePipeline'
import { getOrderListPipeline } from './pipelines/getOrderListPipeline'
import { ChangeLogService, PermissionService, TariffService } from '..'
import checkCrossItems from './checkCrossItems'
import checkRefusedOrder from './checkRefusedOrder'
import getRouteFromTemplate from './getRouteFromTemplate'
import getClientAgreementId from './getClientAgreement'
import getOutsourceAgreementId from './getOutsourceAgreementId'
import { orsDirections } from '../../helpers/orsClient'
import { BadRequestError } from '../../helpers/errors'
import { getDocsRegistryByOrderId } from './getDocsRegistryByOrderId'
import { getPaymentInvoicesByOrderIds } from './getPaymentInvoicesByOrderIds'
import OrderRepository from '../../repositories/order/order.repository'
import { Order as OrderDomain } from '../../domain/order/order.domain'
import { EventBus, Events } from '../../eventBus'

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
      order.confirmedCrew.truck = new mongoose.Types.ObjectId(truck)
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
    checkRefusedOrder(body) // TODO: Удалить после перехода на использование OrderDomain

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

    const orderDomain = new OrderDomain({ ...order, ...body, _id: order._id })
    orderDomain.unlock()

    await OrderRepository.save([orderDomain])

    emitTo(orderDomain.company.toString(), 'order:updated', orderDomain)
    await ChangeLogService.add({
      docId: new mongoose.Types.ObjectId(orderDomain.id),
      company: orderDomain.company,
      coll: 'order',
      user,
      opType: 'update',
      body: JSON.stringify(orderDomain),
    })
    return orderDomain
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
    const orders = await OrderRepository.getOrdersByTrucksAndPeriod({
      truckIds: inputData.truckIds,
      period: inputData.period,
      orderStatuses: ['inProgress', 'completed'],
      company,
    })

    const needSaveOrdes = []
    for (let truck of inputData.truckIds) {
      const ordersByTruck = orders.filter((order) => order.truckId === truck)
      if (ordersByTruck.length === 0) continue

      const { updatedOrders, events } = OrderDomain.autoCompleteOrders(
        ordersByTruck,
        inputData.tripDurationInMinutes,
        inputData.unloadingDurationInMinutes
      )
      if (events.length) {
        emitTo(company.toString(), 'order:autoFillDatesError', {
          token: inputData.operationToken,
          message: `overlapping orders`,
          truck,
        })
      } else if (updatedOrders.length > 0) needSaveOrdes.push(...updatedOrders)
    }

    if (needSaveOrdes.length) {
      await OrderRepository.save(needSaveOrdes)
      needSaveOrdes.forEach((order) => {
        emitTo(company.toString(), 'order:updated', order)
      })
      if (inputData.operationToken) {
        emitTo(company.toString(), 'order:autoFillDatesSuccessful', {
          token: inputData.operationToken,
          message: `count of successfully updated orders: ${needSaveOrdes.length}`,
        })
      }
    }
    emitTo(company.toString(), 'order:autoFillDatesCompleted', {
      token: inputData.operationToken,
      message: `operation completed`,
    })
    return
  }
}

export default new OrderService()
