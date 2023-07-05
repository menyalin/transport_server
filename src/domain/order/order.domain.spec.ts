import { describe, it, expect } from '@jest/globals'
import { Order } from './order.domain'
import dayjs from 'dayjs'

describe('Order.Domain', () => {
  const orderPlannedDate = dayjs('2023-05-27')

  const tripDurationInMinutes = 30
  const unloadingDurationInMinutes = 15

  let orderCompleted1
  let orderInProgress1
  let orderInProgress2
  let orderInProgress3

  beforeEach(() => {
    orderCompleted1 = new Order({
      _id: 'id',
      state: { status: 'completed' },
      orderDate: orderPlannedDate.toISOString(),
      confirmedCrew: { truck: 'truck_id' },
      route: [
        {
          type: 'loading',
          address: 'address',
          arrivalDate: orderPlannedDate.add(1, 'minute').toISOString(),
          departureDate: orderPlannedDate.add(2, 'minute').toISOString(),
        },
        {
          type: 'unloading',
          address: 'address',
          arrivalDate: orderPlannedDate.add(3, 'minute').toISOString(),
          departureDate: orderPlannedDate.add(4, 'minute').toISOString(),
        },
      ],
    })

    orderInProgress1 = new Order({
      _id: 'id',
      state: { status: 'inProgress' },
      orderDate: orderPlannedDate.toISOString(),
      confirmedCrew: { truck: 'truck_id' },
      route: [
        {
          type: 'loading',
          address: 'address',
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
      state: { status: 'inProgress' },
      orderDate: orderPlannedDate.toISOString(),
      confirmedCrew: { truck: 'truck_id' },
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

    orderInProgress3 = new Order({
      _id: 'id',
      state: { status: 'completed' },
      orderDate: orderPlannedDate.toISOString(),
      confirmedCrew: { truck: 'truck_id' },
      route: [
        {
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
        minDate: orderPlannedDate,
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
        minDate: orderPlannedDate,
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
        minDate: orderPlannedDate,
        tripDurationInMinutes,
        unloadingDurationInMinutes,
      })
      expect(updated).toBeTruthy()
      expect(resDate).toEqual(expectedDate)
    })
  })
})
