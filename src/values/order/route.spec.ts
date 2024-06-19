import { Route } from './route'
import { RoutePoint } from './routePoint'

describe('route methods', () => {
  test('main loading point in simple route', () => {
    const route = new Route([
      new RoutePoint({
        type: 'loading',
        address: 'addr1',
      }),
      new RoutePoint({
        type: 'unloading',
        address: 'addr2',
      }),
    ])
    expect(route.mainLoadingPoint.address).toBe('addr1')
  })

  test('main loading point in route with 2 loading points', () => {
    const route = new Route([
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
    expect(route.mainLoadingPoint.address).toBe('addr2')
  })
  test('main loading point in route with 2 loading points without isMainLoadingPoint arg', () => {
    const route = new Route([
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
    expect(route.mainLoadingPoint.address).toBe('addr1')
  })

  test('unloading points in simple route', () => {
    const route = new Route([
      new RoutePoint({
        type: 'loading',
        address: 'addr1',
      }),
      new RoutePoint({
        type: 'unloading',
        address: 'addr2',
      }),
    ])
    expect(route.allUnloadingPoints.map((i) => i.address)).toEqual(['addr2'])
  })
  test('route with 2 unloading points', () => {
    const route = new Route([
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
    expect(route.allUnloadingPoints.map((i) => i.address)).toEqual(['addr2'])
  })

  test('route with 2 loading points without main loading point ', () => {
    const route = new Route([
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
    expect(route.pointsAfterMainLoadingPoint.map((i) => i.address)).toEqual([
      'addr2',
      'addr3',
    ])
  })

  test('route with 2 loading points with return point ', () => {
    const route = new Route([
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

    expect(route.pointsAfterMainLoadingPoint.map((i) => i.address)).toEqual([
      'addr2',
      'addr3',
    ])
  })
})
