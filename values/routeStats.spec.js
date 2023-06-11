import { describe, it, expect } from '@jest/globals'
import { RouteStats } from './routeStats.js'
import { Route } from './route.js'

describe('RouteStats value-oblect', () => {
  it('constructor: unfilled dates in route', () => {
    const route = new Route([
      { type: 'loading', address: '1' },
      { type: 'unloading', address: '1' },
    ])
    const routeStats = new RouteStats(route)
    expect(routeStats.countPoints).toBe(2)
    expect(routeStats.loadingTimesInMinutes).toEqual([0])
    expect(routeStats.unloadingTimesInMinutes).toEqual([0])
    expect(routeStats.tripTimesInMinutes).toEqual([0])
    expect(routeStats.totalDurationInMinutes).toBe(0)
  })

  it('constructor: completed first point', () => {
    const route = new Route([
      {
        type: 'loading',
        address: '1',
        arrivalDateDoc: new Date('2023-06-06T08:00:00.000Z'),
        departureDateDoc: new Date('2023-06-06T09:00:00.000Z'),
      },
      { type: 'unloading', address: '1' },
    ])
    const routeStats = new RouteStats(route)
    expect(routeStats.countPoints).toBe(2)
    expect(routeStats.loadingTimesInMinutes).toEqual([60])
    expect(routeStats.unloadingTimesInMinutes).toEqual([0])
    expect(routeStats.tripTimesInMinutes).toEqual([0])
    expect(routeStats.totalDurationInMinutes).toBe(60)
  })

  it('constructor: completed first point and arrival to second point', () => {
    const route = new Route([
      {
        type: 'loading',
        address: '1',
        arrivalDateDoc: new Date('2023-06-06T08:00:00.000Z'),
        departureDateDoc: new Date('2023-06-06T09:00:00.000Z'),
      },
      {
        type: 'unloading',
        address: '1',
        arrivalDateDoc: new Date('2023-06-06T11:00:00.000Z'),
      },
    ])
    const routeStats = new RouteStats(route)
    expect(routeStats.countPoints).toBe(2)
    expect(routeStats.loadingTimesInMinutes).toEqual([60])
    expect(routeStats.unloadingTimesInMinutes).toEqual([0])
    expect(routeStats.tripTimesInMinutes).toEqual([120])
    expect(routeStats.totalDurationInMinutes).toBe(180)
  })

  it('constructor: completed route', () => {
    const route = new Route([
      {
        type: 'loading',
        address: '1',
        arrivalDateDoc: new Date('2023-06-06T08:00:00.000Z'),
        departureDateDoc: new Date('2023-06-06T09:00:00.000Z'),
      },
      {
        type: 'unloading',
        address: '1',
        arrivalDateDoc: new Date('2023-06-06T11:00:00.000Z'),
        departureDateDoc: new Date('2023-06-06T11:30:00.000Z'),
      },
      {
        type: 'unloading',
        address: '1',
        arrivalDateDoc: new Date('2023-06-06T12:30:00.000Z'),
        departureDateDoc: new Date('2023-06-06T14:30:00.000Z'),
      },
    ])
    const routeStats = new RouteStats(route)
    expect(routeStats.countPoints).toBe(3)
    expect(routeStats.loadingTimesInMinutes).toEqual([60])
    expect(routeStats.unloadingTimesInMinutes).toEqual([30, 120])
    expect(routeStats.tripTimesInMinutes).toEqual([120, 60])
    expect(routeStats.totalDurationInMinutes).toBe(390)
  })

  it('constructor: completed route with return to sender point', () => {
    const route = new Route([
      {
        type: 'loading',
        address: '1',
        arrivalDateDoc: new Date('2023-06-06T08:00:00.000Z'),
        departureDateDoc: new Date('2023-06-06T09:00:00.000Z'),
      },
      {
        type: 'unloading',
        address: '1',
        arrivalDateDoc: new Date('2023-06-06T11:00:00.000Z'),
        departureDateDoc: new Date('2023-06-06T11:30:00.000Z'),
      },
      {
        type: 'unloading',
        address: '1',
        arrivalDateDoc: new Date('2023-06-06T12:30:00.000Z'),
        departureDateDoc: new Date('2023-06-06T14:30:00.000Z'),
        isReturn: true,
      },
    ])
    const routeStats = new RouteStats(route)
    expect(routeStats.countPoints).toBe(2)
    expect(routeStats.loadingTimesInMinutes).toEqual([60])
    expect(routeStats.unloadingTimesInMinutes).toEqual([30, 120])
    expect(routeStats.tripTimesInMinutes).toEqual([120, 60])
    expect(routeStats.totalDurationInMinutes).toBe(390)
  })
})
