import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'
import { TariffPrice } from '../../../values/tariff/tariffPrice'
import { WaitingTariff, IWaitingTariffProps } from './waiting'

describe('create base waiting tariff', () => {
  it('create tariff with valid plainObj', () => {
    const validTariffPlainObj: IWaitingTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 20,
      truckKind: TRUCK_KINDS_ENUM.ref,
      type: TARIFF_TYPES_ENUM.waiting,
      price: 0,
      withVat: false,
      includeHours: 3,
      roundByHours: 24,
      orderType: 'region',
    }
    const tariff = new WaitingTariff(validTariffPlainObj)
    expect(tariff instanceof WaitingTariff).toBe(true)
    expect(tariff.price instanceof TariffPrice).toBe(true)
  })

  it('throw error on attemp to create tariff with invalid type', () => {
    const invalidTariffPlainObj: IWaitingTariffProps = {
      agreement: '1',
      company: '1',
      date: new Date('2023-01-01'),
      liftCapacity: 20,
      truckKind: TRUCK_KINDS_ENUM.ref,
      type: TARIFF_TYPES_ENUM.points,
      price: 10000,
      withVat: false,
      includeHours: 3,
      roundByHours: 24,
      orderType: 'region',
    }

    expect(() => {
      new WaitingTariff(invalidTariffPlainObj)
    }).toThrow()
  })
})
