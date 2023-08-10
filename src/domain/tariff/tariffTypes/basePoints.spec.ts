import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'
import { TariffPrice } from '../../../values/tariff/tariffPrice'
import { BasePointsTariff, IBasePointsTariffProps } from './basePoints'

describe('create base points tariff', () => {
  it('create tariff with valid plainObj', () => {
    const validTariffPlainObj: IBasePointsTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 20,
      truckKind: TRUCK_KINDS_ENUM.ref,
      type: TARIFF_TYPES_ENUM.points,
      price: {
        price: 10000,
        withVat: false,
      },
      loading: '1',
      unloading: '1',
    }
    const tariff = new BasePointsTariff(validTariffPlainObj)
    expect(tariff instanceof BasePointsTariff).toBe(true)
    expect(tariff.price instanceof TariffPrice).toBe(true)
  })

  it('throw error on attemp to create tariff with invalid type', () => {
    const invalidTariffPlainObj: IBasePointsTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 20,
      truckKind: TRUCK_KINDS_ENUM.ref,
      type: TARIFF_TYPES_ENUM.waiting,
      price: 10000,
      priceWOVat: 10000,
      groupVat: false,
      loading: '1',
      unloading: '1',
    }

    expect(() => {
      new BasePointsTariff(invalidTariffPlainObj)
    }).toThrow()
  })
})
