import { OrderPickedForInvoiceDTOProps } from '../interfaces'
import { utils } from './utils'
import { orderWithotPrices as orderWithotPricesData } from './testingData/orderDTOs'

describe('Calc total by types orders sum', () => {
  let orderWithoutPrices: OrderPickedForInvoiceDTOProps

  beforeEach(() => {
    orderWithoutPrices = orderWithotPricesData
  })
  it('order without prices', () => {
    const res = utils.calcTotalByTypes(orderWithoutPrices)
    expect(res.base.price).toBe(0)
    expect(res.base.priceWOVat).toBe(0)
  })

  it('order with base prePrice', () => {
    const res = utils.calcTotalByTypes(
      Object.assign(orderWithoutPrices, {
        agreementVatRate: 20,
        prePrices: [{ priceWOVat: 20000, type: 'base', price: 24000 }],
      })
    )

    expect(res.base.priceWOVat).toBe(20000)
    expect(res.base.price).toBe(24000)
  })
  it('order with base prePrice and finalPrice', () => {
    const res = utils.calcTotalByTypes(
      Object.assign(orderWithoutPrices, {
        agreementVatRate: 20,
        prePrices: [{ priceWOVat: 20000, type: 'base', price: 24000 }],
        finalPrices: [{ priceWOVat: 30000, type: 'base', price: 36000 }],
      })
    )
    expect(res.base.priceWOVat).toBe(30000)
    expect(res.base.price).toBe(36000)
  })

  it('order with base prePrice and finalPrice - zero vat rate', () => {
    const res = utils.calcTotalByTypes(
      Object.assign(orderWithoutPrices, {
        agreementVatRate: 0,
        prePrices: [{ priceWOVat: 20000, type: 'base', price: 20000 }],
        finalPrices: [{ priceWOVat: 30000, type: 'base', price: 30000 }],
      })
    )
    expect(res.base.priceWOVat).toBe(30000)
    expect(res.base.price).toBe(30000)
  })

  it('order with base, loadingDowntime prePrice and base finalPrice - zero vat rate', () => {
    const res = utils.calcTotalByTypes(
      Object.assign(orderWithoutPrices, {
        agreementVatRate: 0,
        prePrices: [{ priceWOVat: 1000, type: 'loadingDowntime', price: 1000 }],
        finalPrices: [{ priceWOVat: 30000, type: 'base', price: 30000 }],
      })
    )
    expect(res.loadingDowntime.priceWOVat).toBe(1000)
    expect(res.base.price).toBe(30000)
  })

  it('order with base, loadingDowntime prePrice and base finalPrice. loadingDowntime finalPrice is zero ', () => {
    const res = utils.calcTotalByTypes(
      Object.assign(orderWithoutPrices, {
        agreementVatRate: 0,
        prePrices: [{ priceWOVat: 1000, type: 'loadingDowntime', price: 1000 }],
        finalPrices: [
          { priceWOVat: 30000, type: 'base', price: 30000 },
          { priceWOVat: 0, type: 'loadingDowntime', price: 0 },
        ],
      })
    )
    expect(res.loadingDowntime.priceWOVat).toBe(0)
    expect(res.base.price).toBe(30000)
  })

  it('order with base, loadingDowntime prices and with paymentPartsSum', () => {
    const res = utils.calcTotalByTypes(
      Object.assign(orderWithoutPrices, {
        agreementVatRate: 20,
        paymentPartsSumWOVat: 5000,
        prePrices: [{ priceWOVat: 1000, type: 'loadingDowntime', price: 1200 }],
        finalPrices: [
          { priceWOVat: 30000, type: 'base', price: 36000 },
          { priceWOVat: 0, type: 'loadingDowntime', price: 0 },
        ],
      })
    )
    expect(res.loadingDowntime.priceWOVat).toBe(0)
    expect(res.base.priceWOVat).toBe(25000)
    expect(res.base.price).toBe(30000)
  })

  it('payment parts total', () => {
    const res = utils.calcTotalByTypes(
      Object.assign(orderWithoutPrices, {
        agreementVatRate: 20,
        itemType: 'paymentPart',
        paymentParts: {
          priceWOVat: 5000,
          client: '1',
          agreement: '1',
          price: 6000,
        },
        finalPrices: [
          { priceWOVat: 30000, type: 'base', price: 36000 },
          { priceWOVat: 0, type: 'loadingDowntime', price: 0 },
        ],
      })
    )
    expect(res.loadingDowntime.priceWOVat).toBe(0)
    expect(res.base.priceWOVat).toBe(5000)
    expect(res.base.price).toBe(6000)
  })
})
