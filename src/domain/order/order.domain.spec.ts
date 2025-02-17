import { describe, it, expect } from '@jest/globals'
import { Order } from './order.domain'
import dayjs from 'dayjs'
import { Client } from './client'
import { OrderPrice } from './orderPrice'
import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'
import { RoutePoint } from './route/routePoint'

describe('Order.Domain', () => {
  const orderPlannedDate = dayjs('2023-05-27')

  const tripDurationInMinutes = 30
  const unloadingDurationInMinutes = 15

  let orderCompleted1: Order
  let orderInProgress1: Order
  let orderInProgress2: Order
  let orderInProgress3: Order
  const mockAnalytics = { type: 'region', distanceDirect: 0, distanceRoad: 0 }
  beforeEach(() => {
    orderCompleted1 = new Order({
      _id: 'id',
      company: '1',
      state: { status: 'completed' },
      orderDate: orderPlannedDate.toISOString(),
      client: new Client({ client: '1' }),
      confirmedCrew: { truck: 'truck_id' },
      analytics: mockAnalytics,
      prices: [
        new OrderPrice({
          type: ORDER_PRICE_TYPES_ENUM.base,
          price: 12,
          priceWOVat: 10,
          sumVat: 2,
        }),
      ],
      route: [
        new RoutePoint({
          type: 'loading',
          address: 'address',
          plannedDate: orderPlannedDate.toISOString(),
          arrivalDate: orderPlannedDate.add(1, 'minute').toISOString(),
          departureDate: orderPlannedDate.add(2, 'minute').toISOString(),
        }),
        new RoutePoint({
          type: 'unloading',
          address: 'address',
          arrivalDate: orderPlannedDate.add(3, 'minute').toISOString(),
          departureDate: orderPlannedDate.add(4, 'minute').toISOString(),
        }),
      ],
    })

    orderInProgress1 = new Order({
      _id: 'id',
      state: { status: 'inProgress' },
      company: '1',
      orderDate: orderPlannedDate.toISOString(),
      confirmedCrew: { truck: 'truck_id' },
      client: new Client({ client: '1' }),
      analytics: mockAnalytics,
      prices: [
        new OrderPrice({
          type: ORDER_PRICE_TYPES_ENUM.base,
          price: 12,
          priceWOVat: 10,
          sumVat: 2,
        }),
      ],
      route: [
        {
          type: 'loading',
          address: 'address',
          plannedDate: orderPlannedDate.toISOString(),
          arrivalDate: orderPlannedDate.add(1, 'minute').toISOString(),
        },
        {
          type: 'unloading',
          address: 'address',
        },
      ],
    })

    orderInProgress2 = new Order({
      _id: 'id',
      company: '1',
      state: { status: 'inProgress' },
      orderDate: orderPlannedDate.toISOString(),
      confirmedCrew: { truck: 'truck_id' },
      client: new Client({ client: '1' }),
      analytics: mockAnalytics,
      prices: [
        new OrderPrice({
          type: ORDER_PRICE_TYPES_ENUM.base,
          price: 12,
          priceWOVat: 10,
          sumVat: 2,
        }),
      ],
      route: [
        {
          plannedDate: orderPlannedDate.toISOString(),
          type: 'loading',
          address: 'address',
        },
        {
          type: 'unloading',
          address: 'address',
        },
      ],
    })

    orderInProgress3 = new Order({
      _id: 'id',
      company: '1',
      state: { status: 'inProgress' },
      orderDate: orderPlannedDate.toISOString(),
      confirmedCrew: { truck: 'truck_id' },
      client: new Client({ client: '1' }),
      analytics: mockAnalytics,
      prices: [
        new OrderPrice({
          type: ORDER_PRICE_TYPES_ENUM.base,
          price: 12,
          priceWOVat: 10,
          sumVat: 2,
        }),
      ],
      route: [
        {
          plannedDate: orderPlannedDate.toISOString(),
          type: 'loading',
          address: 'address',
          arrivalDate: orderPlannedDate.add(1, 'minute').toISOString(),
          departureDate: orderPlannedDate.add(2, 'minute').toISOString(),
        },
        {
          type: 'unloading',
          address: 'address',
          arrivalDate: orderPlannedDate.add(3, 'minute').toISOString(),
        },
      ],
    })
  })

  describe('order state', () => {
    it('should return true in completed order', () => {
      expect(orderCompleted1.isCompleted).toBeTruthy()
    })

    it('should return false in inProgress order', () => {
      expect(orderInProgress1.isCompleted).toBeFalsy()
    })
  })

  describe('last route date', () => {
    it('should return last date in completed order', () => {
      const expectedResult = new Date(
        orderPlannedDate.add(4, 'minute').toISOString()
      )
      expect(orderCompleted1.route.lastRouteDate).toEqual(expectedResult)
    })

    it('should return last date in "inProgress" order', () => {
      const expectedResult = new Date(
        orderPlannedDate.add(1, 'minute').toISOString()
      )
      expect(orderInProgress1.route.lastRouteDate).toEqual(expectedResult)
    })

    it('should return last date in "inProgress" order', () => {
      const expectedResult = new Date(
        orderPlannedDate.add(3, 'minute').toISOString()
      )
      expect(orderInProgress3.route.lastRouteDate).toEqual(expectedResult)
    })

    it('should return NULL in "inProgress" order whithot dates', () => {
      expect(orderInProgress2.route.lastRouteDate).toBeNull()
    })
  })

  describe('fillRouteDatesAndComplete', () => {
    it('completed order: should return a new minDate and "updated" flag is falsy', () => {
      const expectedDate = new Date(
        dayjs(orderCompleted1.route.lastRouteDate)
          .add(tripDurationInMinutes, 'minutes')
          .toISOString()
      )
      const [resDate, updated] = orderCompleted1.fillRouteDatesAndComplete({
        minDate: orderPlannedDate.toDate(),
        tripDurationInMinutes,
        unloadingDurationInMinutes,
      })
      expect(updated).toBeFalsy()
      expect(resDate).toEqual(expectedDate)
    })

    it('inProgress order: should return a new minDate and "updated" flag is truthy', () => {
      const expectedDate = new Date(
        dayjs(orderInProgress1.route.lastRouteDate)
          .add(
            unloadingDurationInMinutes * 2 + tripDurationInMinutes * 2,
            'minutes'
          )
          .toISOString()
      )
      const [resDate, updated] = orderInProgress1.fillRouteDatesAndComplete({
        minDate: orderPlannedDate.toDate(),
        tripDurationInMinutes,
        unloadingDurationInMinutes,
      })
      expect(updated).toBeTruthy()
      expect(resDate).toEqual(expectedDate)
    })

    it('inProgress order without dates: should return a new minDate and "updated" flag is truthy', () => {
      const expectedDate = new Date(
        orderPlannedDate
          .add(
            unloadingDurationInMinutes * 2 + tripDurationInMinutes * 2,
            'minutes'
          )
          .toISOString()
      )
      const [resDate, updated] = orderInProgress2.fillRouteDatesAndComplete({
        minDate: orderPlannedDate.toDate(),
        tripDurationInMinutes,
        unloadingDurationInMinutes,
      })
      expect(updated).toBeTruthy()
      expect(resDate).toEqual(expectedDate)
    })
  })
})
