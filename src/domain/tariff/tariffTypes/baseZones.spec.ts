import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'
import { TariffPrice } from '../../../values/tariff/tariffPrice'
import { BaseZonesTariff, IBaseZonesTariffProps } from './baseZones'

describe('create base zones tariff', () => {
  it('create tariff with valid plainObj', () => {
    const validTariffPlainObj: IBaseZonesTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 20,
      truckKind: TRUCK_KINDS_ENUM.ref,
      type: TARIFF_TYPES_ENUM.zones,
      price: 12000,
      groupVat: true,
      priceWOVat: 10000,
      loadingZone: '1',
      unloadingZone: '1',
    }
    const tariff = new BaseZonesTariff(validTariffPlainObj)
    expect(tariff instanceof BaseZonesTariff).toBe(true)
    expect(tariff.price instanceof TariffPrice).toBe(true)
  })

  it('throw error on attemp to create tariff with invalid type', () => {
    const invalidTariffPlainObj: IBaseZonesTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 20,
      truckKind: TRUCK_KINDS_ENUM.ref,
      type: TARIFF_TYPES_ENUM.waiting,
      price: 10000,
      groupVat: false,
      priceWOVat: 1000,
      loadingZone: '1',
      unloadingZone: '1',
    }

    expect(() => {
      new BaseZonesTariff(invalidTariffPlainObj)
    }).toThrow()
  })
})
