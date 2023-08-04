import { TARIFF_TYPES_ENUM } from '../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../constants/truck'

import { BasePointsTariff, IBasePointsTariffProps } from './tariffTypes'
import { Tariff } from './tariff.domain'

describe('create tariffs any type', () => {
  it('create base tariff from valid object', () => {
    const validObj: IBasePointsTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 10,
      type: TARIFF_TYPES_ENUM.points,
      truckKind: TRUCK_KINDS_ENUM.ref,
      loading: '1',
      unloading: '2',
      price: 1000,
      withVat: false,
    }

    const tariff = Tariff.create(validObj)
    expect(tariff).toBeInstanceOf(BasePointsTariff)
  })

  it('to throw error on create base tariff from invalid object', () => {
    const invalidObj: IBasePointsTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 10,
      type: TARIFF_TYPES_ENUM.zones,
      truckKind: TRUCK_KINDS_ENUM.ref,
      loading: '1',
      unloading: '2',
      price: 1000,
      withVat: false,
    }

    expect(() => {
      Tariff.create(invalidObj)
    }).toThrowError()
  })
})
