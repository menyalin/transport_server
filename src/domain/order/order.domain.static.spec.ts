// @ts-nocheck
import dayjs from 'dayjs'
import { describe, it, expect } from '@jest/globals'
import { Order } from './order.domain'
import { Client } from './client'

describe('Order.Domain static functions', () => {
  const orderPlannedDate1 = dayjs('2023-05-27T06:00:00.000Z')
  const orderPlannedDate2 = dayjs('2023-05-27T09:00:00.000Z')
  const orderPlannedDate3 = dayjs('2023-05-28T14:00:00.000Z')

  const tripDurationInMinutes = 30
  const unloadingDurationInMinutes = 15

  let orderCompleted1
  let orderInProgress1
  let orderInProgress2
  let orderInProgress3

  beforeEach(() => {
    orderCompleted1 = new Order({
      _id: 'id1',
      state: { status: 'completed' },
      orderDate: orderPlannedDate1.toISOString(),
      confirmedCrew: { truck: 'truck_id' },
      client: new Client({ client: '1' }),
      route: [
        {
          type: 'loading',
          address: 'address',
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
      route: [
        {
          type: 'loading',
          address: 'address',
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
      route: [
        {
          type: 'loading',
          address: 'address',
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
      route: [
        {
          type: 'loading',
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
      const orders = []
      const { updatedOrders, events } = Order.autoCompleteOrders(
        orders,
        tripDurationInMinutes,
        unloadingDurationInMinutes
      )
      expect(events.length).toBe(0)
      expect(updatedOrders.length).toBe(0)
    })

    it('should throw error if orders is not array', () => {
      const orders = 'not array'
      expect(() => {
        Order.autoCompleteOrders(
          orders,
          tripDurationInMinutes,
          unloadingDurationInMinutes
        )
      }).toThrowError()
    })

    // Overlapping orders
    it('should return "update_order_error", overlapping orders', () => {
      const orders = [orderCompleted1, orderInProgress3]
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
