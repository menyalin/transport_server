import { Types } from 'mongoose'

import { OrderAnalytics } from '@/domain/order/analytics'
import { Order } from '@/domain/order/order.domain'
import { createTestOrder } from './createOrder'
import { createAgreement } from './createAgreement'
import { DirectDistanceZonesBaseTariff } from '../DirectDistanceZonesBaseTariff'
import { RoutePoint } from '@/domain/order/route/routePoint'

const createTariff = (args: object): DirectDistanceZonesBaseTariff =>
  new DirectDistanceZonesBaseTariff({
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

describe('DirectDistanceZonesBaseTariff', () => {
  describe('canApplyToOrder', () => {
    it('success selecting tariff', () => {
      const loadingZoneId = new Types.ObjectId().toString()

      const order: Order = createTestOrder({
        analytics: createOrderAnalytics({
          distanceDirect: 55,
          loadingZones: [loadingZoneId],
          unloadingZones: [loadingZoneId, loadingZoneId],
        }),
      })
      const tariff = createTariff({
        loadingZone: loadingZoneId,
        zones: [
          { price: 1000, distance: 60 },
          { price: 2000, distance: 100 },
        ],
      })
      tariff.setContractData({
        withVat: true,
        contractName: 'fake contract',
        contractDate: new Date('2024-05-11'),
      })
      expect(tariff.canApplyToOrder(order)).toBeTruthy()
    })

    it('failure selecting tariff. distance is large', () => {
      const loadingZoneId = new Types.ObjectId().toString()

      const order: Order = createTestOrder({
        analytics: createOrderAnalytics({
          distanceDirect: 110,
          loadingZones: [loadingZoneId],
          unloadingZones: [loadingZoneId, loadingZoneId],
        }),
      })
      const tariff = createTariff({
        loadingZone: loadingZoneId,
        zones: [
          { price: 1000, distance: 60 },
          { price: 2000, distance: 100 },
        ],
      })
      tariff.setContractData({
        withVat: true,
        contractName: 'fake contract',
        contractDate: new Date('2024-05-11'),
      })
      expect(tariff.canApplyToOrder(order)).toBeFalsy()
    })
    it('failure selecting tariff. invalid zone', () => {
      const loadingZoneId = new Types.ObjectId().toString()
      const secondLoadingZoneId = new Types.ObjectId().toString()

      const order: Order = createTestOrder({
        analytics: createOrderAnalytics({
          distanceDirect: 110,
          loadingZones: [secondLoadingZoneId],
          unloadingZones: [loadingZoneId, loadingZoneId],
        }),
      })
      const tariff = createTariff({
        loadingZone: loadingZoneId,
        zones: [
          { price: 1000, distance: 60 },
          { price: 2000, distance: 100 },
        ],
      })
      tariff.setContractData({
        withVat: true,
        contractName: 'fake contract',
        contractDate: new Date('2024-05-11'),
      })
      expect(tariff.canApplyToOrder(order)).toBeFalsy()
    })
  })

  describe('calculateForOrder', () => {
    it('simple order without additional points', () => {
      const loadingZoneId = new Types.ObjectId().toString()
      const agreement = createAgreement({
        vatRate: 20,
      })

      const order: Order = createTestOrder({
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
        analytics: createOrderAnalytics({
          distanceDirect: 55,
          loadingZones: [loadingZoneId],
          unloadingZones: [loadingZoneId, loadingZoneId],
        }),
      })
      const tariff = createTariff({
        loadingZone: loadingZoneId,
        includedPoints: 3,
        pointPrice: 1000,
        zones: [
          { price: 1000, distance: 60 },
          { price: 2000, distance: 100 },
        ],
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
      expect(basePrice.price).toBe(1200)
      expect(basePrice.priceWOVat).toBe(1000)
      expect(additionalPoints.price).toBe(0)
      expect(additionalPoints.priceWOVat).toBe(0)
    })

    it('Order with additional points', () => {
      const loadingZoneId = new Types.ObjectId().toString()
      const agreement = createAgreement({
        vatRate: 20,
      })

      const order: Order = createTestOrder({
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
            address: '1',
            plannedDate: new Date('2024-01-02'),
          }),
          new RoutePoint({
            type: 'unloading',
            address: '1',
            isReturn: true, // Не учитывается как доп.точка
            plannedDate: new Date('2024-01-02'),
          }),
        ],
        analytics: createOrderAnalytics({
          distanceDirect: 149,
          loadingZones: [loadingZoneId],
          unloadingZones: [loadingZoneId, loadingZoneId],
        }),
      })
      const tariff = createTariff({
        loadingZone: loadingZoneId,
        includedPoints: 2,
        pointPrice: 1000,
        zones: [
          { price: 1000, distance: 60 },
          { price: 2000, distance: 100 },
          { price: 3000, distance: 150 },
        ],
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
      expect(basePrice.price).toBe(3600)
      expect(basePrice.priceWOVat).toBe(3000)
      expect(additionalPoints.price).toBe(1200)
      expect(additionalPoints.priceWOVat).toBe(1000)
    })
  })
})
