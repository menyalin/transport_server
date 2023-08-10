import { TARIFF_TYPES_ENUM } from '../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../constants/truck'
import { createTariff } from './tariff.creator'
import { BasePointsTariff, IBasePointsTariffProps } from './tariffTypes'

describe('create tariffs any type', () => {
  it('create base tariff from valid object: (old tariff schema)', () => {
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
      priceWOVat: 1000,
      groupVat: false,
    }

    const tariff = createTariff(validObj)
    expect(tariff).toBeInstanceOf(BasePointsTariff)
  })

  it('create base tariff from valid object: (new tariff schema)', () => {
    const validObj: IBasePointsTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 10,
      type: TARIFF_TYPES_ENUM.points,
      truckKind: TRUCK_KINDS_ENUM.ref,
      loading: '1',
      unloading: '2',
      price: {
        price: 1000,
        withVat: true,
      },
    }

    const tariff = createTariff(validObj)
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
      priceWOVat: 1000,
      groupVat: false,
    }

    expect(() => {
      createTariff(invalidObj)
    }).toThrowError()
  })
})
