import { OrderPickedForInvoiceDTO } from '../../domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import {
  IGetOrdersForPaymentInvoiceProps,
  IPickOrdersForPaymentInvoiceProps,
} from '../../domain/paymentInvoice/interfaces'
import { PaymentInvoice as PaymentInvoiceModel } from '../../models'
import { getOrdersForPaymentInvoice } from './getOrdersForInvoice'
import { pickOrdersForPaymentInvoice } from './pickOrdersForPaymentInvoice'
class PaymentInvoiceRepository {
  async pickOrdersForPaymentInvoice(
    params: IPickOrdersForPaymentInvoiceProps
  ): Promise<OrderPickedForInvoiceDTO[]> {
    return await pickOrdersForPaymentInvoice(params)
  }

  async getOrdersForInvoice(
    params: IGetOrdersForPaymentInvoiceProps
  ): Promise<OrderPickedForInvoiceDTO[]> {
    return await getOrdersForPaymentInvoice(params)
  }
}

export default new PaymentInvoiceRepository()
