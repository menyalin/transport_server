import { Route } from './route'
import { RoutePoint } from './routePoint'

describe('route methods', () => {
  let route1: Route
  let route2: Route
  let route3: Route
  let route4: Route

  beforeEach(() => {
    route1 = new Route([
      new RoutePoint({
        type: 'loading',
        address: 'addr1',
      }),
      new RoutePoint({
        type: 'unloading',
        address: 'addr2',
      }),
    ])

    route2 = new Route([
      new RoutePoint({
        type: 'loading',
        address: 'addr1',
      }),
      new RoutePoint({
        type: 'loading',
        address: 'addr2',
        isMainLoadingPoint: true,
      }),
      new RoutePoint({
        type: 'unloading',
        address: 'addr2',
      }),
    ])

    route3 = new Route([
      new RoutePoint({
        type: 'loading',
        address: 'addr1',
      }),
      new RoutePoint({
        type: 'loading',
        address: 'addr2',
      }),
      new RoutePoint({
        type: 'unloading',
        address: 'addr3',
      }),
    ])
    route4 = new Route([
      new RoutePoint({
        type: 'loading',
        address: 'addr1',
        isMainLoadingPoint: true,
      }),
      new RoutePoint({
        type: 'loading',
        address: 'addr2',
      }),
      new RoutePoint({
        type: 'unloading',
        address: 'addr3',
      }),
      new RoutePoint({
        type: 'unloading',
        address: 'addr4',
        isReturn: true,
      }),
    ])
  })

  test('main loading point in simple route', () => {
    expect(route1.mainLoadingPoint.address).toBe('addr1')
  })

  test('main loading point in route with 2 loading points', () => {
    expect(route2.mainLoadingPoint.address).toBe('addr2')
  })
  test('main loading point in route with 2 loading points without isMainLoadingPoint arg', () => {
    expect(route3.mainLoadingPoint.address).toBe('addr1')
  })

  test('unloading points in simple route', () => {
    expect(route1.unloadingPoints.map((i) => i.address)).toEqual(['addr2'])
  })
  test('route with 2 unloading points', () => {
    expect(route2.unloadingPoints.map((i) => i.address)).toEqual(['addr2'])
  })

  test('route with 2 loading points without main loading point ', () => {
    expect(route3.unloadingPoints.map((i) => i.address)).toEqual([
      'addr2',
      'addr3',
    ])
  })

  test('route with 2 loading points with return point ', () => {
    expect(route3.unloadingPoints.map((i) => i.address)).toEqual([
      'addr2',
      'addr3',
    ])
  })
})
