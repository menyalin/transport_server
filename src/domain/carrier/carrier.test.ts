import { Carrier } from './carrier'

describe('Carrier.getVatRateByDate', () => {
  test('должен вернуть null, если vatRates отсутствует', () => {
    const carrier = new Carrier({
      name: 'Test',
      company: '507f1f77bcf86cd799439011',
      agreements: [],
      outsource: false,
      allowUseCustomerRole: false,
      isActive: true,
      vatRates: null,
    })

    expect(carrier.getVatRateByDate(new Date('2024-01-15'))).toBeNull()
  })

  test('должен вернуть null, если vatRates пустой массив', () => {
    const carrier = new Carrier({
      name: 'Test',
      company: '507f1f77bcf86cd799439011',
      agreements: [],
      outsource: false,
      allowUseCustomerRole: false,
      isActive: true,
      vatRates: [],
    })

    expect(carrier.getVatRateByDate(new Date('2024-01-15'))).toBeNull()
  })

  test('должен вернуть ставку НДС, если дата попадает в период (без endPeriod)', () => {
    const carrier = new Carrier({
      name: 'Test',
      company: '507f1f77bcf86cd799439011',
      agreements: [],
      outsource: false,
      allowUseCustomerRole: false,
      isActive: true,
      vatRates: [
        {
          startPeriod: '2024-01-01',
          vatRate: 20,
        },
      ],
    })

    expect(carrier.getVatRateByDate(new Date('2024-01-15'))).toBe(20)
    expect(carrier.getVatRateByDate(new Date('2024-01-01'))).toBe(20)
    expect(carrier.getVatRateByDate(new Date('2025-01-01'))).toBe(20)
  })

  test('должен вернуть ставку НДС, если дата попадает в период с endPeriod', () => {
    const carrier = new Carrier({
      name: 'Test',
      company: '507f1f77bcf86cd799439011',
      agreements: [],
      outsource: false,
      allowUseCustomerRole: false,
      isActive: true,
      vatRates: [
        {
          startPeriod: '2024-01-01',
          endPeriod: '2024-12-31',
          vatRate: 20,
        },
      ],
    })

    expect(carrier.getVatRateByDate(new Date('2024-01-01'))).toBe(20)
    expect(carrier.getVatRateByDate(new Date('2024-06-15'))).toBe(20)
    expect(carrier.getVatRateByDate(new Date('2024-12-30'))).toBe(20)
  })

  test('должен вернуть null, если дата равна endPeriod (строго меньше)', () => {
    const carrier = new Carrier({
      name: 'Test',
      company: '507f1f77bcf86cd799439011',
      agreements: [],
      outsource: false,
      allowUseCustomerRole: false,
      isActive: true,
      vatRates: [
        {
          startPeriod: '2024-01-01',
          endPeriod: '2024-12-31',
          vatRate: 20,
        },
      ],
    })

    expect(carrier.getVatRateByDate(new Date('2024-12-31'))).toBeNull()
  })

  test('должен вернуть null, если дата меньше startPeriod', () => {
    const carrier = new Carrier({
      name: 'Test',
      company: '507f1f77bcf86cd799439011',
      agreements: [],
      outsource: false,
      allowUseCustomerRole: false,
      isActive: true,
      vatRates: [
        {
          startPeriod: '2024-06-01',
          endPeriod: '2024-12-31',
          vatRate: 20,
        },
      ],
    })

    expect(carrier.getVatRateByDate(new Date('2024-05-31'))).toBeNull()
  })

  test('должен вернуть null, если дата больше endPeriod', () => {
    const carrier = new Carrier({
      name: 'Test',
      company: '507f1f77bcf86cd799439011',
      agreements: [],
      outsource: false,
      allowUseCustomerRole: false,
      isActive: true,
      vatRates: [
        {
          startPeriod: '2024-01-01',
          endPeriod: '2024-12-31',
          vatRate: 20,
        },
      ],
    })

    expect(carrier.getVatRateByDate(new Date('2025-01-01'))).toBeNull()
  })

  test('должен вернуть правильную ставку из нескольких периодов', () => {
    const carrier = new Carrier({
      name: 'Test',
      company: '507f1f77bcf86cd799439011',
      agreements: [],
      outsource: false,
      allowUseCustomerRole: false,
      isActive: true,
      vatRates: [
        {
          startPeriod: '2023-01-01',
          endPeriod: '2023-12-31',
          vatRate: 18,
        },
        {
          startPeriod: '2024-01-01',
          endPeriod: '2024-12-31',
          vatRate: 20,
        },
        {
          startPeriod: '2025-01-01',
          vatRate: 25,
        },
      ],
    })

    expect(carrier.getVatRateByDate(new Date('2023-06-15'))).toBe(18)
    expect(carrier.getVatRateByDate(new Date('2024-06-15'))).toBe(20)
    expect(carrier.getVatRateByDate(new Date('2025-06-15'))).toBe(25)
  })

  test('должен вернуть ставку для даты на границе startPeriod', () => {
    const carrier = new Carrier({
      name: 'Test',
      company: '507f1f77bcf86cd799439011',
      agreements: [],
      outsource: false,
      allowUseCustomerRole: false,
      isActive: true,
      vatRates: [
        {
          startPeriod: '2024-01-01',
          endPeriod: '2024-12-31',
          vatRate: 20,
        },
      ],
    })

    expect(carrier.getVatRateByDate(new Date('2024-01-01'))).toBe(20)
  })
})
