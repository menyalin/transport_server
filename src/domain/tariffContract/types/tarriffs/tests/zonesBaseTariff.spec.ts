import { Types } from 'mongoose'
import { ZonesBaseTariff } from '../ZonesBaseTariff'
import { OrderAnalytics } from '@/domain/order/analytics'
import { Order } from '@/domain/order/order.domain'
import { createTestOrder } from './createOrder'
import { RoutePoint } from '@/values/order/routePoint'
import { createAgreement } from './createAgreement'

const createTariff = (args: object): ZonesBaseTariff =>
  new ZonesBaseTariff({
    truckKinds: ['ref'],
    liftCapacities: [20],
    ...args,
  })

const createOrderAnalytics = (args: object): OrderAnalytics =>
  new OrderAnalytics({
    distanceDirect: 50,
    distanceRoad: 50,
    type: 'region',

    ...args,
  })

describe('ZonesBaseTariff', () => {
  describe('canApplyToOrder', () => {
    it('success selecting tariff for multiple unloading zones', () => {
      const loadingZoneId = new Types.ObjectId().toString()
      const unloadingZone1 = new Types.ObjectId().toString()
      const unloadingZone2 = new Types.ObjectId().toString()
      const order: Order = createTestOrder({
        analytics: createOrderAnalytics({
          loadingZones: [loadingZoneId],
          unloadingZones: [unloadingZone1, unloadingZone2],
        }),
      })
      const tariff = createTariff({
        loadingZone: loadingZoneId,
        unloadingZones: [unloadingZone1, unloadingZone2],
        price: 1000,
      })
      tariff.setContractData({
        withVat: true,
        contractName: 'fake contract',
        contractDate: new Date('2024-05-11'),
      })
      expect(tariff.canApplyToOrder(order)).toBeTruthy()
    })

    it('failure in reverse sequence of unloading zones', () => {
      const loadingZoneId = new Types.ObjectId().toString()
      const unloadingZone1 = new Types.ObjectId().toString()
      const unloadingZone2 = new Types.ObjectId().toString()
      const order: Order = createTestOrder({
        analytics: createOrderAnalytics({
          loadingZones: [loadingZoneId],
          unloadingZones: [unloadingZone2, unloadingZone1],
        }),
      })
      const tariff = createTariff({
        loadingZone: loadingZoneId,
        unloadingZones: [unloadingZone1, unloadingZone2],
        price: 1000,
      })
      tariff.setContractData({
        withVat: true,
        contractName: 'fake contract',
        contractDate: new Date('2024-05-11'),
      })
      const res = tariff.canApplyToOrder(order)
      expect(res).toBeFalsy()
    })

    it('success if the unloading zone in the order is a loading zone', () => {
      const loadingZoneId = new Types.ObjectId().toString()
      const unloadingZone1 = new Types.ObjectId().toString()
      const unloadingZone2 = new Types.ObjectId().toString()

      const order: Order = createTestOrder({
        analytics: createOrderAnalytics({
          loadingZones: [loadingZoneId],
          unloadingZones: [unloadingZone1, unloadingZone2],
        }),
      })

      const tariff = createTariff({
        loadingZone: loadingZoneId,
        unloadingZones: [unloadingZone1, unloadingZone2],
        price: 1000,
      })

      tariff.setContractData({
        withVat: true,
        contractName: 'fake contract',
        contractDate: new Date('2024-05-11'),
      })
      expect(tariff.canApplyToOrder(order)).toBeTruthy()
    })

    it('success if the unloading zone in the order is a loading zone', () => {
      const loadingZoneId = new Types.ObjectId().toString()
      const unloadingZone1 = new Types.ObjectId().toString()
      const unloadingZone2 = new Types.ObjectId().toString()
      const otherZone = new Types.ObjectId().toString()

      const order: Order = createTestOrder({
        analytics: createOrderAnalytics({
          loadingZones: [loadingZoneId, otherZone],
          unloadingZones: [
            unloadingZone1,
            otherZone,
            otherZone,
            unloadingZone2,
            unloadingZone2,
            otherZone,
          ],
        }),
      })

      const tariff = createTariff({
        loadingZone: loadingZoneId,
        unloadingZones: [unloadingZone1, unloadingZone2],
        price: 1000,
      })

      tariff.setContractData({
        withVat: true,
        contractName: 'fake contract',
        contractDate: new Date('2024-05-11'),
      })
      expect(tariff.canApplyToOrder(order)).toBeTruthy()
    })

    it('failure of tariff', () => {
      const loadingZoneId = new Types.ObjectId().toString()
      const unloadingZone1 = new Types.ObjectId().toString()
      const unloadingZone2 = new Types.ObjectId().toString()
      const otherZone = new Types.ObjectId().toString()

      const order: Order = createTestOrder({
        analytics: createOrderAnalytics({
          loadingZones: [loadingZoneId, otherZone, unloadingZone1],
          unloadingZones: [
            unloadingZone1,
            otherZone,
            otherZone,
            unloadingZone2,
            unloadingZone2,
            otherZone,
            unloadingZone1,
          ],
        }),
      })

      const tariff = createTariff({
        loadingZone: loadingZoneId,
        unloadingZones: [unloadingZone1, unloadingZone2],
        price: 1000,
      })

      tariff.setContractData({
        withVat: true,
        contractName: 'fake contract',
        contractDate: new Date('2024-05-11'),
      })
      expect(tariff.canApplyToOrder(order)).toBeFalsy()
    })

    it('Запрет на применение тарифа при совпадении зоны погрузки и расхождении зон разгрузки', () => {
      const loadingZoneId = new Types.ObjectId().toString()
      const unloadingZoneId = new Types.ObjectId().toString()
      const otherZone = new Types.ObjectId().toString()

      const order: Order = createTestOrder({
        analytics: createOrderAnalytics({
          loadingZones: [loadingZoneId],
          unloadingZones: [otherZone],
        }),
      })

      const tariff = createTariff({
        loadingZone: loadingZoneId,
        unloadingZones: [unloadingZoneId],
        price: 1000,
      })

      tariff.setContractData({
        withVat: false,
        contractName: 'fake contract',
        contractDate: new Date('2024-05-11'),
      })
      expect(tariff.canApplyToOrder(order)).toBeFalsy()
    })
  })

  describe('calculateForOrder', () => {
    it('simple order without additional points', () => {
      const loadingZoneId = new Types.ObjectId().toString()
      const unloadingZone1 = new Types.ObjectId().toString()
      const unloadingZone2 = new Types.ObjectId().toString()
      const agreement = createAgreement({
        vatRate: 20,
      })
      const order: Order = createTestOrder({
        analytics: createOrderAnalytics({}),
        route: [
          new RoutePoint({
            type: 'loading',
            address: '1',
            isMainLoadingPoint: true,
            plannedDate: new Date('2024-01-01'),
          }),
          new RoutePoint({
            type: 'unloading',
            address: '1',
            plannedDate: new Date('2024-01-02'),
          }),
        ],
      })

      const tariff = createTariff({
        loadingZone: loadingZoneId,
        unloadingZones: [unloadingZone1, unloadingZone2],
        price: 10000,
        pointPrice: 1000,
      })
      tariff.setContractData({
        withVat: false,
        contractName: 'fake contract',
        contractDate: new Date('2024-05-11'),
      })
      const [basePrice, additionalPoints] = tariff.calculateForOrder(
        order,
        agreement
      )
      expect(basePrice.price).toBe(12000)
      expect(basePrice.sumVat).toBe(2000)
      expect(additionalPoints.price).toBe(0)
      expect(additionalPoints.sumVat).toBe(0)
    })

    it('simple order with one additional point', () => {
      const loadingZoneId = new Types.ObjectId().toString()
      const unloadingZone1 = new Types.ObjectId().toString()
      const unloadingZone2 = new Types.ObjectId().toString()
      const agreement = createAgreement({
        vatRate: 20,
      })
      const order: Order = createTestOrder({
        analytics: createOrderAnalytics({}),
        route: [
          new RoutePoint({
            type: 'loading',
            address: '1',
            isMainLoadingPoint: true,
            plannedDate: new Date('2024-01-01'),
          }),
          new RoutePoint({
            type: 'unloading',
            address: '1',
            plannedDate: new Date('2024-01-02'),
          }),
          new RoutePoint({
            type: 'unloading',
            address: '2',
            plannedDate: new Date('2024-01-03'),
          }),
        ],
      })

      const tariff = createTariff({
        loadingZone: loadingZoneId,
        unloadingZones: [unloadingZone1, unloadingZone2],
        price: 10000,
        pointPrice: 1000,
      })
      tariff.setContractData({
        withVat: false,
        contractName: 'fake contract',
        contractDate: new Date('2024-05-11'),
      })
      const [basePrice, additionalPoints] = tariff.calculateForOrder(
        order,
        agreement
      )
      expect(basePrice.price).toBe(12000)
      expect(basePrice.priceWOVat).toBe(10000)
      expect(basePrice.sumVat).toBe(2000)
      expect(additionalPoints.price).toBe(1200)
      expect(additionalPoints.priceWOVat).toBe(1000)
      expect(additionalPoints.sumVat).toBe(200)
    })

    it('simple order has one additional point and return', () => {
      const loadingZoneId = new Types.ObjectId().toString()
      const unloadingZone1 = new Types.ObjectId().toString()
      const unloadingZone2 = new Types.ObjectId().toString()
      const agreement = createAgreement({
        vatRate: 20,
      })
      const order: Order = createTestOrder({
        analytics: createOrderAnalytics({}),
        route: [
          new RoutePoint({
            type: 'loading',
            address: '1',
            isMainLoadingPoint: true,
            plannedDate: new Date('2024-01-01'),
          }),
          new RoutePoint({
            type: 'unloading',
            address: '1',
            plannedDate: new Date('2024-01-02'),
          }),
          new RoutePoint({
            type: 'unloading',
            address: '2',
            plannedDate: new Date('2024-01-03'),
          }),
          new RoutePoint({
            type: 'unloading',
            isReturn: true,
            address: '2',
            plannedDate: new Date('2024-01-03'),
          }),
        ],
      })

      const tariff = createTariff({
        loadingZone: loadingZoneId,
        unloadingZones: [unloadingZone1, unloadingZone2],
        price: 10000,
        pointPrice: 1000,
      })
      tariff.setContractData({
        withVat: false,
        contractName: 'fake contract',
        contractDate: new Date('2024-05-11'),
      })
      const [basePrice, additionalPoints] = tariff.calculateForOrder(
        order,
        agreement
      )
      expect(basePrice.price).toBe(12000)
      expect(basePrice.priceWOVat).toBe(10000)
      expect(basePrice.sumVat).toBe(2000)
      expect(additionalPoints.price).toBe(1200)
      expect(additionalPoints.priceWOVat).toBe(1000)
      expect(additionalPoints.sumVat).toBe(200)
    })
  })
})
