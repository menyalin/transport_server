import { Types } from 'mongoose'
import { TariffContract } from '../tariffContract'
import {
  DirectDistanceZonesBaseTariff,
  ZonesBaseTariff,
} from '../tariffContract/types/tarriffs'
import { OrderPriceCalculator } from './orderPriceCalculator'
/*
  agreement: string
  name: string
  company: string
  startDate: Date
  endDate: Date | null
  isActive: Boolean = true
  withVat: Boolean
  zonesTariffs: ZonesBaseTariff[]
  directDistanceZonesTariffs: DirectDistanceZonesBaseTariff[]
  additionalPointsTariffs: AdditionalPointsTariff[]
  returnPercentTariffs: ReturnPercentTariff[]
  idleTimeTariffs: IdleTimeTariff[]
*/

describe('basePricePrioritySorter', () => {
  let calculator: OrderPriceCalculator
  let contract1: TariffContract
  let contract2: TariffContract
  let contract3: TariffContract
  const zone1 = new Types.ObjectId()
  const zone2 = new Types.ObjectId()
  const zone3 = new Types.ObjectId()
  const agreementId = new Types.ObjectId()
  const companyId = new Types.ObjectId()
  beforeEach(() => {
    calculator = new OrderPriceCalculator()
    contract1 = new TariffContract({
      agreement: agreementId,
      name: 'Соглашение №1',
      company: companyId,
      startDate: new Date('2024-01-01'),
      endDate: null,
      withVat: false,
      directDistanceZonesTariffs: [],
      additionalPointsTariffs: [],
      returnPercentTariffs: [],
      idleTimeTariffs: [],
      zonesTariffs: [
        new ZonesBaseTariff({
          truckKinds: ['ref'],
          liftCapacities: [20],
          loadingZone: zone1,
          unloadingZones: [zone2],
          price: 10000,
        }),
      ],
    })
    contract2 = new TariffContract({
      agreement: agreementId,
      name: 'Соглашение №2 ',
      company: companyId,
      startDate: new Date('2024-02-01'),
      endDate: null,
      withVat: false,
      directDistanceZonesTariffs: [
        new DirectDistanceZonesBaseTariff({
          truckKinds: ['ref'],
          liftCapacities: [20],
          loadingZone: zone1,
          zones: [
            { distance: 50, price: 20000 },
            { distance: 100, price: 25000 },
          ],
        }),
      ],
      additionalPointsTariffs: [],
      returnPercentTariffs: [],
      idleTimeTariffs: [],
      zonesTariffs: [
        new ZonesBaseTariff({
          truckKinds: ['ref'],
          liftCapacities: [20],
          loadingZone: zone1,
          unloadingZones: [zone2],
          price: 12000,
        }),
        new ZonesBaseTariff({
          truckKinds: ['ref'],
          liftCapacities: [20],
          loadingZone: zone1,
          unloadingZones: [zone2, zone3],
          price: 15000,
        }),
      ],
    })
  })

  it('should return zones tariff with 2 unloading zones in last contract', () => {
    const res = calculator.basePricePrioritySorter([contract2, contract1])
    expect((res[0] as ZonesBaseTariff).price).toBe(15000)
  })
  it('should return array contains DirectDistanceZonesBaseTariff', () => {
    const res = calculator.basePricePrioritySorter([contract2, contract1])
    expect(
      res.some((i) => i instanceof DirectDistanceZonesBaseTariff)
    ).toBeTruthy()
  })
})
