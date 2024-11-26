import { Types } from 'mongoose'

import { OrderAnalytics } from '@/domain/order/analytics'
import { Order } from '@/domain/order/order.domain'
import { createTestOrder } from './createOrder'

import { createAgreement } from './createAgreement'
import { IdleTimeTariff } from '../IdleTimeTariff'
import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'
import { RoutePoint } from '@/domain/order/route/routePoint'

const createTariff = (args: object): IdleTimeTariff =>
  new IdleTimeTariff({
    truckKinds: ['ref'],
    liftCapacities: [20],
    orderTypes: ['region'],
    ...args,
  })

const createOrderAnalytics = (args: object): OrderAnalytics =>
  new OrderAnalytics({
    distanceDirect: 50,
    distanceRoad: 50,
    type: 'region',

    ...args,
  })

describe('IdleTimeTariff: calculate for order', () => {
  it('idleTimeInMinutes: private method', () => {
    const agreement = createAgreement({
      vatRate: 0,
      calcWaitingByArrivalDateLoading: false,
      calcWaitingByArrivalDateUnloading: false,
      noWaitingPaymentForAreLateLoading: false,
      noWaitingPaymentForAreLateUnloading: false,
    })
    const order: Order = createTestOrder({
      analytics: createOrderAnalytics({}),
      route: [
        new RoutePoint({
          type: 'loading',
          address: '1',
          isMainLoadingPoint: true,
          plannedDate: new Date('2024-01-02T00:00:00.000Z'),
          arrivalDate: new Date('2024-01-01T23:53:00.000Z'),
          departureDate: new Date('2024-01-02T00:10:00.000Z'),
        }),
        new RoutePoint({
          type: 'loading',
          address: '1',
          isMainLoadingPoint: true,
          plannedDate: new Date('2024-01-02T00:00:00.000Z'),
          arrivalDate: new Date('2024-01-02T00:05:00.000Z'),
          departureDate: new Date('2024-01-02T00:10:00.000Z'),
        }),
        new RoutePoint({
          type: 'unloading',
          address: '1',
          plannedDate: new Date('2024-01-05'),
          arrivalDate: new Date('2024-01-05'),
          departureDate: new Date('2024-01-05'),
        }),
      ],
    })
    const tariff: any = createTariff({
      includeHours: 1,
      roundingInterval: 'hour',
      tariffBy: 'hour',
      price: 1000,
    })

    tariff.setContractData({
      withVat: false,
      contractName: 'fake contract',
      contractDate: new Date('2024-05-15'),
    })
    const idleTimeInMinutes: number[] = tariff.idleTimeInMinutes(
      order,
      agreement,
      ORDER_PRICE_TYPES_ENUM.loadingDowntime
    )
    expect(idleTimeInMinutes).toEqual([10, 5])
  })

  it('calculateForOrder: Округление простоя на погрузке в меньшую сторону. простой 10 минут', () => {
    const agreement = createAgreement({
      vatRate: 0,
      calcWaitingByArrivalDateLoading: false,
      calcWaitingByArrivalDateUnloading: false,
      noWaitingPaymentForAreLateLoading: false,
      noWaitingPaymentForAreLateUnloading: false,
    })
    const order: Order = createTestOrder({
      analytics: createOrderAnalytics({}),
      route: [
        new RoutePoint({
          type: 'loading',
          address: '1',
          isMainLoadingPoint: true,
          plannedDate: new Date('2024-01-02T00:00:00.000Z'),
          arrivalDate: new Date('2024-01-01T23:53:00.000Z'),
          departureDate: new Date('2024-01-02T00:10:00.000Z'),
        }),
        new RoutePoint({
          type: 'loading',
          address: '1',
          isMainLoadingPoint: true,
          plannedDate: new Date('2024-01-02T00:00:00.000Z'),
          arrivalDate: new Date('2024-01-02T00:05:00.000Z'),
          departureDate: new Date('2024-01-02T00:10:00.000Z'),
        }),
        new RoutePoint({
          type: 'unloading',
          address: '1',
          plannedDate: new Date('2024-01-05'),
          arrivalDate: new Date('2024-01-05'),
          departureDate: new Date('2024-01-05'),
        }),
      ],
    })
    const tariff = createTariff({
      includeHours: 0,
      roundingInterval: 'hour',
      tariffBy: 'hour',
      price: 1000,
    })

    tariff.setContractData({
      withVat: false,
      contractName: 'fake contract',
      contractDate: new Date('2024-05-15'),
    })
    const [loadingDowntime, unloadingDowntime, returnDowntime] =
      tariff.calculateForOrder(order, agreement)
    expect(loadingDowntime.price).toEqual(0)
    expect(unloadingDowntime.price).toEqual(0)
    expect(returnDowntime.price).toEqual(0)
  })

  it('calculateForOrder: Округление простоя на погрузке до 1 часа', () => {
    const agreement = createAgreement({
      vatRate: 0,
      calcWaitingByArrivalDateLoading: false,
      calcWaitingByArrivalDateUnloading: false,
      noWaitingPaymentForAreLateLoading: false,
      noWaitingPaymentForAreLateUnloading: false,
    })
    const order: Order = createTestOrder({
      analytics: createOrderAnalytics({}),
      route: [
        new RoutePoint({
          type: 'loading',
          address: '1',
          isMainLoadingPoint: true,
          plannedDate: new Date('2024-01-02T00:00:00.000Z'),
          arrivalDate: new Date('2024-01-01T23:53:00.000Z'),
          departureDate: new Date('2024-01-02T00:30:00.000Z'),
        }),
        new RoutePoint({
          type: 'loading',
          address: '1',
          plannedDate: new Date('2024-01-02T00:00:00.000Z'),
          arrivalDate: new Date('2024-01-02T00:05:00.000Z'),
          departureDate: new Date('2024-01-02T00:10:00.000Z'),
        }),
        new RoutePoint({
          type: 'unloading',
          address: '1',
          plannedDate: new Date('2024-01-05'),
          arrivalDate: new Date('2024-01-05'),
          departureDate: new Date('2024-01-05'),
        }),
      ],
    })
    const tariff = createTariff({
      includeHours: 0,
      roundingInterval: 'hour',
      tariffBy: 'hour',
      price: 1000,
    })

    tariff.setContractData({
      withVat: false,
      contractName: 'fake contract',
      contractDate: new Date('2024-05-15'),
    })
    const [loadingDowntime, unloadingDowntime, returnDowntime] =
      tariff.calculateForOrder(order, agreement)

    expect(loadingDowntime.price).toEqual(1000)
    expect(unloadingDowntime.price).toEqual(0)
    expect(returnDowntime.price).toEqual(0)
  })

  it('calculateForOrder: Запрет оплаты простоя при опоздании на погрузку', () => {
    const agreement = createAgreement({
      vatRate: 0,
      calcWaitingByArrivalDateLoading: false,
      calcWaitingByArrivalDateUnloading: false,
      noWaitingPaymentForAreLateLoading: true,
      noWaitingPaymentForAreLateUnloading: true,
    })
    const order: Order = createTestOrder({
      analytics: createOrderAnalytics({}),
      route: [
        new RoutePoint({
          type: 'loading',
          address: '1',
          isMainLoadingPoint: true,
          plannedDate: new Date('2024-01-02T00:00:00.000Z'),
          arrivalDate: new Date('2024-01-02T00:05:00.000Z'),
          departureDate: new Date('2024-01-02T01:30:00.000Z'),
        }),

        new RoutePoint({
          type: 'unloading',
          address: '1',
          plannedDate: new Date('2024-01-05'),
          arrivalDate: new Date('2024-01-05'),
          departureDate: new Date('2024-01-05'),
        }),
      ],
    })
    const tariff = createTariff({
      includeHours: 0,
      roundingInterval: 'hour',
      tariffBy: 'hour',
      price: 1000,
    })

    tariff.setContractData({
      withVat: false,
      contractName: 'fake contract',
      contractDate: new Date('2024-05-15'),
    })
    const [loadingDowntime, unloadingDowntime, returnDowntime] =
      tariff.calculateForOrder(order, agreement)

    expect(loadingDowntime.price).toEqual(0)
    expect(unloadingDowntime.price).toEqual(0)
    expect(returnDowntime.price).toEqual(0)
  })

  it('calculateForOrder: Оплата простоя на выгрузке по фактическому времени прибытия', () => {
    const agreement = createAgreement({
      vatRate: 0,
      calcWaitingByArrivalDateLoading: false,
      calcWaitingByArrivalDateUnloading: true,
      noWaitingPaymentForAreLateLoading: false,
      noWaitingPaymentForAreLateUnloading: false,
    })
    const order: Order = createTestOrder({
      analytics: createOrderAnalytics({}),
      route: [
        new RoutePoint({
          type: 'loading',
          address: '1',
          isMainLoadingPoint: true,
          plannedDate: new Date('2024-01-02T00:00:00.000Z'),
          arrivalDate: new Date('2024-01-02T00:00:00.000Z'),
          departureDate: new Date('2024-01-02T00:10:00.000Z'),
        }),

        new RoutePoint({
          type: 'unloading',
          address: '1',
          plannedDate: new Date('2024-01-03T00:00:00.000Z'),
          arrivalDate: new Date('2024-01-02T22:00:00.000Z'),
          departureDate: new Date('2024-01-03T00:00:00.000Z'),
        }),
      ],
    })
    const tariff = createTariff({
      includeHours: 0,
      roundingInterval: 'hour',
      tariffBy: 'hour',
      price: 1000,
    })

    tariff.setContractData({
      withVat: false,
      contractName: 'fake contract',
      contractDate: new Date('2024-05-15'),
    })
    const [loadingDowntime, unloadingDowntime, returnDowntime] =
      tariff.calculateForOrder(order, agreement)

    expect(loadingDowntime.price).toEqual(0)
    expect(unloadingDowntime.price).toEqual(2000)
    expect(returnDowntime.price).toEqual(0)
  })

  it('calculateForOrder: округление времени простоя до 1 часа по плановому времени прибытия', () => {
    const agreement = createAgreement({
      vatRate: 0,
      calcWaitingByArrivalDateLoading: false,
      calcWaitingByArrivalDateUnloading: false,
      noWaitingPaymentForAreLateLoading: false,
      noWaitingPaymentForAreLateUnloading: false,
    })
    const order: Order = createTestOrder({
      analytics: createOrderAnalytics({}),
      route: [
        new RoutePoint({
          type: 'loading',
          address: '1',
          isMainLoadingPoint: true,
          plannedDate: new Date('2024-01-02T00:00:00.000Z'),
          arrivalDate: new Date('2024-01-02T00:00:00.000Z'),
          departureDate: new Date('2024-01-02T00:10:00.000Z'),
        }),

        new RoutePoint({
          type: 'unloading',
          address: '1',
          arrivalDate: new Date('2024-01-03T00:00:00.000Z'),
          departureDate: new Date('2024-01-03T23:29:01.000Z'),
        }),
      ],
    })
    const tariff = createTariff({
      includeHours: 0,
      roundingInterval: 'hour',
      tariffBy: 'hour',
      price: 10000,
    })

    tariff.setContractData({
      withVat: false,
      contractName: 'fake contract',
      contractDate: new Date('2024-05-15'),
    })
    const [loadingDowntime, unloadingDowntime, returnDowntime] =
      tariff.calculateForOrder(order, agreement)

    expect(loadingDowntime.price).toEqual(0)
    expect(unloadingDowntime.price).toEqual(230000)
    expect(returnDowntime.price).toEqual(0)
  })

  it('calculateForOrder: расчет простоя на выгрузке по плановому времени прибытия, внесенному бухгалтером', () => {
    const agreement = createAgreement({
      vatRate: 0,
      calcWaitingByArrivalDateLoading: false,
      calcWaitingByArrivalDateUnloading: false,
      noWaitingPaymentForAreLateLoading: false,
      noWaitingPaymentForAreLateUnloading: false,
    })
    const order: Order = createTestOrder({
      analytics: createOrderAnalytics({}),
      route: [
        new RoutePoint({
          type: 'loading',
          address: '1',
          isMainLoadingPoint: true,
          plannedDate: new Date('2024-01-02T00:00:00.000Z'),
          arrivalDate: new Date('2024-01-02T00:00:00.000Z'),
          departureDate: new Date('2024-01-02T00:10:00.000Z'),
        }),

        new RoutePoint({
          type: 'unloading',
          address: '1',
          plannedDate: new Date('2024-01-03T00:00:00.000Z'),
          plannedDateDoc: new Date('2024-01-03T22:00:00.000Z'),
          arrivalDate: new Date('2024-01-03T20:00:00.000Z'),
          departureDate: new Date('2024-01-03T23:10:01.000Z'),
        }),
      ],
    })
    const tariff = createTariff({
      includeHours: 0,
      roundingInterval: 'hour',
      tariffBy: 'hour',
      price: 10000,
    })

    tariff.setContractData({
      withVat: false,
      contractName: 'fake contract',
      contractDate: new Date('2024-05-15'),
    })
    const [loadingDowntime, unloadingDowntime, returnDowntime] =
      tariff.calculateForOrder(order, agreement)

    expect(loadingDowntime.price).toEqual(0)
    expect(unloadingDowntime.price).toEqual(10000)
    expect(returnDowntime.price).toEqual(0)
  })
})
