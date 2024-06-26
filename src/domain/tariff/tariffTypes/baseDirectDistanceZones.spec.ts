import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'

import {
  IDirectDistanceZonesTariffProps,
  BaseDirectDistanceZonesTariff,
} from './baseDirectDistanceZones'

describe('create tariff', () => {
  it('create tariff with valid plainObj', () => {
    const validTariffPlainObj: IDirectDistanceZonesTariffProps = {
      agreement: '1',
      company: '1',
      loading: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 20,
      truckKind: TRUCK_KINDS_ENUM.ref,
      type: TARIFF_TYPES_ENUM.directDistanceZones,
      price: 0,
      priceWOVat: 0,
      zones: [
        { distance: 10, price: 30 },
        { distance: 20, price: 40 },
      ],
      groupVat: false,
    }
    const tariff = new BaseDirectDistanceZonesTariff(validTariffPlainObj)
    expect(tariff instanceof BaseDirectDistanceZonesTariff).toBe(true)
  })

  it('throw error on attemp to create tariff with invalid type', () => {
    const invalidTariffPlainObj: IDirectDistanceZonesTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 20,
      loading: '1',
      truckKind: TRUCK_KINDS_ENUM.ref,
      type: TARIFF_TYPES_ENUM.waiting,
      groupVat: false,
      price: 0,
      priceWOVat: 0,
      zones: [
        { distance: 10, price: 30 },
        { distance: 20, price: 40 },
      ],
    }

    expect(() => {
      new BaseDirectDistanceZonesTariff(invalidTariffPlainObj)
    }).toThrow()
  })

  it('throw error on attemp to create tariff with invalid zones array', () => {
    const invalidTariffPlainObj: IDirectDistanceZonesTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 20,
      truckKind: TRUCK_KINDS_ENUM.ref,
      type: TARIFF_TYPES_ENUM.waiting,
      price: 0,
      priceWOVat: 0,
      groupVat: false,
      zones: [],
      loading: '1',
    }

    expect(() => {
      new BaseDirectDistanceZonesTariff(invalidTariffPlainObj)
    }).toThrow()
  })
})
