import { PaymentInvoiceDomain } from './paymentInvoice'

describe('PaymentInvoiceDomain.vatRateInfoIsMissing', () => {
  const mockInvoiceData = {
    _id: '507f1f77bcf86cd799439011',
    company: '507f1f77bcf86cd799439012',
    number: 'INV-001',
    date: new Date('2024-01-01'),
    client: { _id: '507f1f77bcf86cd799439013' },
    agreement: '507f1f77bcf86cd799439014',
    status: 'draft',
    isActive: true,
  }

  test('должен вернуть true, если vatRate равен null', () => {
    const invoice = PaymentInvoiceDomain.create({
      ...mockInvoiceData,
      vatRate: null,
      usePriceWithVat: true,
    })
    expect(invoice.vatRateInfoIsMissing).toBe(true)
  })

  test('должен вернуть true, если vatRate равен undefined', () => {
    const invoice = PaymentInvoiceDomain.create({
      ...mockInvoiceData,
      usePriceWithVat: true,
    })
    expect(invoice.vatRateInfoIsMissing).toBe(true)
  })

  test('должен вернуть true, если usePriceWithVat равен null', () => {
    const invoice = PaymentInvoiceDomain.create({
      ...mockInvoiceData,
      vatRate: 20,
      usePriceWithVat: null as any,
    })
    expect(invoice.vatRateInfoIsMissing).toBe(true)
  })

  test('должен вернуть true, если usePriceWithVat равен undefined', () => {
    const invoice = PaymentInvoiceDomain.create({
      ...mockInvoiceData,
      vatRate: 20,
    })
    expect(invoice.vatRateInfoIsMissing).toBe(true)
  })

  test('должен вернуть true, если оба поля отсутствуют', () => {
    const invoice = PaymentInvoiceDomain.create({
      ...mockInvoiceData,
    })
    expect(invoice.vatRateInfoIsMissing).toBe(true)
  })

  test('должен вернуть false, если vatRate = 0 и usePriceWithVat = true', () => {
    const invoice = PaymentInvoiceDomain.create({
      ...mockInvoiceData,
      vatRate: 0,
      usePriceWithVat: true,
    })
    expect(invoice.vatRateInfoIsMissing).toBe(false)
  })

  test('должен вернуть false, если vatRate = 0 и usePriceWithVat = false', () => {
    const invoice = PaymentInvoiceDomain.create({
      ...mockInvoiceData,
      vatRate: 0,
      usePriceWithVat: false,
    })
    expect(invoice.vatRateInfoIsMissing).toBe(false)
  })

  test('должен вернуть false, если vatRate = 20 и usePriceWithVat = true', () => {
    const invoice = PaymentInvoiceDomain.create({
      ...mockInvoiceData,
      vatRate: 20,
      usePriceWithVat: true,
    })
    expect(invoice.vatRateInfoIsMissing).toBe(false)
  })

  test('должен вернуть false, если vatRate > 0 и usePriceWithVat = false', () => {
    const invoice = PaymentInvoiceDomain.create({
      ...mockInvoiceData,
      vatRate: 10,
      usePriceWithVat: false,
    })
    expect(invoice.vatRateInfoIsMissing).toBe(false)
  })
})
