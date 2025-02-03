import { Types } from 'mongoose'
import {
  Order as OrderModel,
  OrderTemplate as OrderTemplateModel,
} from '../../models'
import { emitTo } from '../../socket'
import { getSchedulePipeline } from './pipelines/getSchedulePipeline'
import { AgreementService, ChangeLogService, PermissionService } from '..'
import checkCrossItems from './checkCrossItems'
import getRouteFromTemplate from './getRouteFromTemplate'
import getClientAgreementId from './getClientAgreement'
import { getOutsourceAgreementId } from './getOutsourceAgreementId'
import { orsDirections } from '../../helpers/orsClient'
import { BadRequestError } from '../../helpers/errors'
import { getDocsRegistryByOrderId } from './getDocsRegistryByOrderId'
import { getPaymentInvoicesByOrderIds } from './getPaymentInvoicesByOrderIds'
import {
  OrderRepository,
  AddressRepository,
  TariffContractRepository,
  PrintFormRepository,
  IncomingInvoiceRepository,
} from '@/repositories'
import { Order as OrderDomain } from '@/domain/order/order.domain'
import { bus } from '@/eventBus'
import {
  OrdersUpdatedEvent,
  OrderTruckChanged,
  OrderReturnedFromInProgressStatus,
} from '@/domain/order/domainEvents'
import { OrderAnalytics } from '@/domain/order/analytics'
import { OrderPriceCalculator } from '@/domain/orderPriceCalculator/orderPriceCalculator'
import { OrderPrice } from '@/domain/order/orderPrice'
import { TariffContract } from '@/domain/tariffContract'
import * as helpers from '@/shared/helpers'
import { AddressZone } from '@/domain/address'
import { PrintForm } from '@/domain/printForm/printForm.domain'
import { orderPFBuilder } from './printForms/pfBuilder'
import { Route } from '@/domain/order/route/route'
import { RouteStats } from '@/domain/order/route/routeStats'
import { isValidObjectId } from 'mongoose'

class OrderService {
  async create({ body, user }: { body: any; user: string }) {
    await PermissionService.checkPeriod({
      userId: user,
      companyId: body.company,
      operation: 'order:daysForWrite',
      startDate: body.route[0].plannedDate,
    })
    OrderDomain.isValidBody(body)
    await checkCrossItems({ body })

    if (!body.client.agreement && body.route[0].plannedDate)
      body.client.agreement = await getClientAgreementId(body)

    if (body.confirmedCrew?.truck)
      body.confirmedCrew.outsourceAgreement = await getOutsourceAgreementId(
        body.confirmedCrew?.truck,
        body.route[0].plannedDate
      )

    const order = await OrderRepository.create(body)
    order.analytics = await this.updateOrderAnalytics(order)
    order.prePrices = await this.updatePrePrices(order)
    bus.publish(OrdersUpdatedEvent([order]))
    emitTo(order.company.toString(), 'order:created', order.toObject())
    await ChangeLogService.add({
      docId: order._id,
      company: order.company,
      coll: 'order',
      user,
      opType: 'create',
      body: order.toObject(),
    })
    return order
  }

  async createFromTemplate({ body, user }: { body: any; user: string }) {
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
      if (!template) continue
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

  async disableOrder({ orderId, state }: { orderId: string; state: boolean }) {
    const order = await OrderRepository.getById(orderId)
    order.isDisabled = state
    emitTo(order.company, 'order:updated', order)
    bus.publish(OrdersUpdatedEvent([order]))
  }

  async moveOrderInSchedule(
    {
      orderId,
      truck,
      startPositionDate,
    }: { orderId: any; truck: any; startPositionDate: any },
    user: string
  ) {
    const order = await OrderRepository.getById(orderId)
    if (!truck) {
      order.confirmedCrew.truck = null
      order.confirmedCrew.outsourceAgreement = null
    } else {
      order.confirmedCrew.truck = truck
      order.confirmedCrew.outsourceAgreement = await getOutsourceAgreementId(
        truck,
        order.orderDate
      )
    }
    order.confirmedCrew.driver = null
    order.confirmedCrew.trailer = null
    order.confirmedCrew.tkName = null
    order.startPositionDate = startPositionDate
    order.isDisabled = false
    emitTo(order.company, 'order:updated', order.toObject())
    bus.publish(OrdersUpdatedEvent([order]))

    await ChangeLogService.add({
      docId: order._id,
      company: order.company,
      coll: 'order',
      user,
      opType: 'move order',
      body: order.toObject(),
    })
  }

  async getList(params: any) {
    return await OrderRepository.getList(params)
  }

  async getListForSchedule({
    profile,
    startDate,
    endDate,
  }: {
    profile: string
    startDate: string
    endDate: string
  }) {
    try {
      const pipeline = getSchedulePipeline({
        company: profile,
        startDate,
        endDate,
      })
      const res = await OrderModel.aggregate(pipeline)
      return res
    } catch (e: any) {
      throw new Error(e?.message)
    }
  }

  async deleteById({ id, user }: { id: string; user: string }) {
    const order: OrderDomain = await OrderRepository.getById(id)
    order.remove()
    order.events.forEach((event) => {
      bus.publish(event)
    })
    order.clearEvents()
    await ChangeLogService.add({
      docId: order.id,
      company: order.company,
      coll: 'order',
      user,
      opType: 'delete',
      body: JSON.stringify(order),
    })
    return order
  }

  async getById(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestError(`Invalid order id: ${id}`)

    const allowedStatusesForGetDocsRegistry = ['completed']
    const order: any = await OrderModel.findById(id).lean()
    if (
      order &&
      allowedStatusesForGetDocsRegistry.includes(order.state.status)
    ) {
      order.docsRegistry = await getDocsRegistryByOrderId(order._id.toString())

      order.paymentInvoices = await getPaymentInvoicesByOrderIds([
        order._id?.toString(),
        ...(order?.paymentParts?.map((i: any) => i._id.toString()) || []),
      ])
      order.incomingInvoice = await IncomingInvoiceRepository.getForOrderById(
        order._id
      )
    }
    return order
  }

  async getAllowedPrintForms(): Promise<PrintForm[]> {
    return await PrintFormRepository.getTemplatesByType({
      docType: 'order',
    })
  }

  async downloadDoc({
    orderId,
    templateName,
  }: {
    orderId: string
    templateName: string
  }): Promise<Buffer> {
    const docBuffer: Buffer = await orderPFBuilder({
      orderId,
      templateName,
    })
    return docBuffer
  }

  async updateFinalPrices({
    orderId,
    finalPrices,
    user,
  }: {
    orderId: string
    finalPrices: any[]
    user: string
  }) {
    const order = await OrderRepository.getById(orderId)
    order.setFinalPrices(finalPrices)
    bus.publish(OrdersUpdatedEvent([order]))

    emitTo(
      order.company.toString(),
      `order:${orderId}:finalPriceUpdated`,
      order.toObject()
    )
    await ChangeLogService.add({
      docId: order._id,
      company: order.company,
      coll: 'order',
      user,
      opType: 'updateFinalPrices',
      body: JSON.stringify(order.toObject()),
    })
    return order
  }

  async updateOne({ id, body, user }: { id: string; body: any; user: string }) {
    OrderDomain.isValidBody(body)
    const newVersionOrder = new OrderDomain({ _id: id, ...body })

    newVersionOrder.setClientAgreement(await getClientAgreementId(body))

    if (newVersionOrder.truckId)
      body.confirmedCrew.outsourceAgreement = await getOutsourceAgreementId(
        newVersionOrder.truckId,
        newVersionOrder.orderDate
      )

    let existedOrder = await OrderRepository.getById(id)

    if (!existedOrder) return null

    // если в маршруте изменились даты проверяется пересечение с другими записями

    if (!existedOrder.isCompleted) {
      const datesNotChanged = helpers.isEqualDatesOfRoute(
        existedOrder.route,
        newVersionOrder.route
      )
      if (!datesNotChanged) await checkCrossItems({ body, id })
    }

    // контроль разрешения на редактирвоание выполненного рейса
    if (existedOrder.isCompleted)
      await PermissionService.checkPeriod({
        userId: user,
        companyId: existedOrder.company,
        operation: 'order:daysForWrite',
        startDate: existedOrder.route.lastRouteDate,
      })

    // если в рейсе есть массив с документами, то заполняю признак получения документов
    if (body.docs && body.docs.length && !body.docsState?.getted) {
      body.docsState = {
        getted: true,
        date: new Date(),
      }
    }

    if (newVersionOrder.truckId !== existedOrder.truckId)
      bus.publish(OrderTruckChanged({ orderId: existedOrder.id }))

    if (
      existedOrder.isInProgress &&
      ['getted', 'needGet'].includes(newVersionOrder.state?.status || '')
    ) {
      bus.publish(
        OrderReturnedFromInProgressStatus({ orderId: existedOrder._id })
      )
    }

    const updatedOrder = new OrderDomain({
      ...existedOrder.toObject(),
      ...newVersionOrder.toObject(),
      _id: existedOrder._id,
    })
    updatedOrder.setDisableStatus(false)
    updatedOrder.analytics = await this.updateOrderAnalytics(updatedOrder)
    updatedOrder.prePrices = await this.updatePrePrices(updatedOrder)

    bus.publish(OrdersUpdatedEvent([updatedOrder]))

    emitTo(updatedOrder.company, 'order:updated', updatedOrder)

    await ChangeLogService.add({
      docId: new Types.ObjectId(updatedOrder.id),
      company: updatedOrder.company,
      coll: 'order',
      user,
      opType: 'update',
      body: updatedOrder.toObject(),
    })

    return updatedOrder
  }

  async refresh(order: OrderDomain): Promise<void> {
    order.analytics = await this.updateOrderAnalytics(order)
    order.prePrices = await this.updatePrePrices(order)
    order.confirmedCrew.outsourceAgreement = order.truckId
      ? await getOutsourceAgreementId(order.truckId, order.orderDate)
      : null
    bus.publish(OrdersUpdatedEvent([order]))
  }

  async updateOrderAnalytics(order: OrderDomain): Promise<OrderAnalytics> {
    const loadingZones: string[] = await AddressRepository.getPointsZones([
      order.route.mainLoadingPoint,
    ])
    const unloadingZones: string[] = await AddressRepository.getPointsZones(
      order.route.allUnloadingPoints
    )

    return new OrderAnalytics({
      type: order.analytics?.type ?? 'region',
      distanceDirect: order.analytics?.distanceDirect ?? 0,
      distanceRoad: order.analytics?.distanceRoad ?? 0,
      loadingZones,
      unloadingZones,
      routeStats: new RouteStats(order.route),
    })
  }

  async updatePrePrices(order: OrderDomain): Promise<OrderPrice[]> {
    const priceCalculator = new OrderPriceCalculator()
    const prePrices: OrderPrice[] = []
    if (order.clientAgreementId) {
      const agreement = await AgreementService.getById(order.clientAgreementId)
      if (!agreement) return []
      const tariffContracts: TariffContract[] =
        await TariffContractRepository.getByAgreementAndDate(
          agreement,
          order.orderDate
        )
      // Поучаем зоны из тарифных контрактов
      let zoneIds: string[] = []
      tariffContracts.forEach((i) => {
        zoneIds = zoneIds.concat(
          ...i.getAllZones().filter((zone) => !zoneIds.includes(zone))
        )
      })
      const zones: AddressZone[] =
        await AddressRepository.getZonesByIds(zoneIds)

      prePrices.push(
        ...priceCalculator.basePrice(order, tariffContracts, agreement, zones),
        ...priceCalculator.idlePrice(order, tariffContracts, agreement),
        ...priceCalculator.returnPrice(order, tariffContracts, agreement)
      )
    }
    return prePrices
  }

  async getDistance({ coords }: { coords: any[] }) {
    try {
      const radiusesArray: any[] = []
      coords.forEach(() => {
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
      return { distanceRoad: 0, durationInSec: 0, durationStr: 'TODO' }
    }
  }

  async setDocsState(id: string, state: boolean) {
    const order = await OrderModel.findById(id)
    if (!order) throw new BadRequestError('order not found')
    order.docsState = {
      getted: state,
      date: state ? new Date() : undefined,
    }

    await order.save()
    emitTo(order.company.toString(), 'order:updated', order)
    return order
  }

  async setDocs(id: string, docs: any[]) {
    const order = await OrderModel.findById(id)
    if (!order) throw new BadRequestError('order not found')
    order.docs = docs
    if (docs.length && !order.docsState?.getted)
      order.docsState = {
        getted: true,
        date: new Date(),
      }

    await order.save()
    emitTo(order.company.toString(), 'order:updated', order)
    return order
  }

  async autoSetRoutesDates(inputData: any, company: string) {
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
          message: `Кол-во успешно обновленных рейсов: ${needSaveOrdes.length}`,
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
