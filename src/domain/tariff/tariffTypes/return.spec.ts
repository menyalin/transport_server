import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'
import { TariffPrice } from '../../../values/tariff/tariffPrice'
import { ReturnTariff } from './index'
import { IReturnTariffProps } from './return'

describe('create base return tariff', () => {
  it('create tariff with valid plainObj', () => {
    const validTariffPlainObj: IReturnTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 20,
      truckKind: TRUCK_KINDS_ENUM.ref,
      type: TARIFF_TYPES_ENUM.return,
      percentOfTariff: 10,
    }
    const tariff = new ReturnTariff(validTariffPlainObj)
    expect(tariff instanceof ReturnTariff).toBe(true)
  })

  it('throw error on attemp to create tariff with invalid type', () => {
    const invalidTariffPlainObj: IReturnTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 20,
      truckKind: TRUCK_KINDS_ENUM.ref,
      type: TARIFF_TYPES_ENUM.points,
      percentOfTariff: 10,
    }

    expect(() => {
      new ReturnTariff(invalidTariffPlainObj)
    }).toThrow()
  })
})
