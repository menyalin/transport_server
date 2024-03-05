import {
  PaymentInvoice as PaymentInvoiceModel,
  OrderInPaymentInvoice as OrderInPaymentInvoiceModel,
} from '../../models'

export const getPaymentInvoicesByOrderIds = async (ids: string[] = []) => {
  if (!ids.length)
    throw new Error('getPaymentInvoicesByOrderId: orderIds is required')

  const items = await OrderInPaymentInvoiceModel.find({
    order: ids,
  }).lean()
  if (!items.length) return null

  const invoices = await PaymentInvoiceModel.find({
    _id: items.map((i) => i.paymentInvoice.toString()),
  }).lean()

  return invoices
}
