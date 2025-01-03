import dayjs from 'dayjs'
import { describe, it, expect } from '@jest/globals'
import { Order } from './order.domain'
import { Client } from './client'
import { OrderPrice } from './orderPrice'
import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'
import { OrderAnalytics } from './analytics'

describe('Order.Domain static functions', () => {
  const orderPlannedDate1 = dayjs('2023-05-27T06:00:00.000Z')
  const orderPlannedDate2 = dayjs('2023-05-27T09:00:00.000Z')

  const tripDurationInMinutes = 30
  const unloadingDurationInMinutes = 15

  let orderCompleted1: Order
  let orderInProgress1: Order
  let orderInProgress2: Order
  let orderInProgress3: Order
  const mockAnalytics = { type: 'region', distanceDirect: 0, distanceRoad: 0 }
  beforeEach(() => {
    orderCompleted1 = new Order({
      _id: 'id1',
      company: '1',
      prices: [
        new OrderPrice({
          type: ORDER_PRICE_TYPES_ENUM.base,
          price: 12,
          sumVat: 2,
          priceWOVat: 10,
        }),
      ],
      state: { status: 'completed' },
      orderDate: orderPlannedDate1.toISOString(),
      confirmedCrew: { truck: 'truck_id' },
      client: new Client({ client: '1' }),
      analytics: mockAnalytics,
      route: [
        {
          type: 'loading',
          address: 'address',
          plannedDate: new Date('2023-01-01'),
          arrivalDate: orderPlannedDate1.toISOString(),
          departureDate: orderPlannedDate1.add(15, 'minute').toISOString(),
        },
        {
          type: 'unloading',
          address: 'address',
          arrivalDate: orderPlannedDate1.add(30, 'minute').toISOString(),
          departureDate: orderPlannedDate1.add(45, 'minute').toISOString(),
        },
      ],
    })

    orderInProgress3 = new Order({
      _id: 'id3',
      state: { status: 'inProgress' },
      orderDate: orderPlannedDate1.add(40, 'minutes').toISOString(),
      confirmedCrew: { truck: 'truck_id' },
      client: new Client({ client: '1' }),
      analytics: mockAnalytics,
      company: '1',
      prices: [
        new OrderPrice({
          type: ORDER_PRICE_TYPES_ENUM.base,
          price: 12,
          sumVat: 2,
          priceWOVat: 10,
        }),
      ],
      route: [
        {
          type: 'loading',
          address: 'address',
          plannedDate: new Date('2023-01-01'),
          arrivalDate: orderPlannedDate1.add(15, 'minute').toISOString(),
        },
        {
          type: 'unloading',
          address: 'address',
        },
      ],
    })

    orderInProgress1 = new Order({
      _id: 'id2',
      state: { status: 'inProgress' },
      orderDate: orderPlannedDate2.toISOString(),
      confirmedCrew: { truck: 'truck_id' },
      client: new Client({ client: '1' }),
      analytics: mockAnalytics,
      company: '1',
      prices: [
        new OrderPrice({
          type: ORDER_PRICE_TYPES_ENUM.base,
          price: 12,
          sumVat: 2,
          priceWOVat: 10,
        }),
      ],
      route: [
        {
          type: 'loading',
          address: 'address',
          plannedDate: new Date('2023-01-01'),
          arrivalDate: orderPlannedDate2.toISOString(),
        },
        {
          type: 'unloading',
          address: 'address',
        },
      ],
    })

    orderInProgress2 = new Order({
      _id: 'id4',
      state: { status: 'inProgress' },
      orderDate: orderPlannedDate1.toISOString(),
      confirmedCrew: { truck: 'truck_id' },
      client: new Client({ client: '1' }),
      analytics: mockAnalytics,
      company: '1',
      prices: [
        new OrderPrice({
          type: ORDER_PRICE_TYPES_ENUM.base,
          price: 12,
          sumVat: 2,
          priceWOVat: 10,
        }),
      ],
      route: [
        {
          type: 'loading',
          plannedDate: new Date('2023-01-01'),
          address: 'address',
        },
        {
          type: 'unloading',
          address: 'address',
        },
      ],
    })
  })

  describe('autoCompleteOrders', () => {
    it('should return one updated order', () => {
      const orders = [orderCompleted1, orderInProgress1]
      const { updatedOrders, events } = Order.autoCompleteOrders(
        orders,
        tripDurationInMinutes,
        unloadingDurationInMinutes
      )
      expect(events.length).toBe(0)
      expect(updatedOrders.length).toBe(1)
    })

    it('should return empty updated orders array', () => {
      const orders = [orderCompleted1]
      const { updatedOrders, events } = Order.autoCompleteOrders(
        orders,
        tripDurationInMinutes,
        unloadingDurationInMinutes
      )
      expect(events.length).toBe(0)
      expect(updatedOrders.length).toBe(0)
    })

    it('should return empty updated orders array. empty orders array', () => {
      const orders: Order[] = []
      const { updatedOrders, events } = Order.autoCompleteOrders(
        orders,
        tripDurationInMinutes,
        unloadingDurationInMinutes
      )
      expect(events.length).toBe(0)
      expect(updatedOrders.length).toBe(0)
    })

    // Overlapping orders
    it('should return "update_order_error", overlapping orders', () => {
      const orders: Order[] = [orderCompleted1, orderInProgress3]
      const { updatedOrders, events } = Order.autoCompleteOrders(
        orders,
        tripDurationInMinutes,
        unloadingDurationInMinutes
      )
      expect(events.length).toBe(1)
      expect(updatedOrders.length).toBe(0)
    })
  })
})
