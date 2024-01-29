import { OrderPickedForInvoiceDTO } from '../../domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import {
  IGetOrdersForPaymentInvoiceProps,
  IPickOrdersForPaymentInvoiceProps,
} from '../../domain/paymentInvoice/interfaces'
import { PaymentInvoiceDomain } from '../../domain/paymentInvoice/paymentInvoice'
import {
  PaymentInvoice as PaymentInvoiceModel,
  OrderInPaymentInvoice as OrderInPaymentInvoiceModel,
} from '../../models'
import { getOrdersForPaymentInvoice } from './getOrdersForInvoice'
import { pickOrdersForPaymentInvoice } from './pickOrdersForPaymentInvoice'
import { getOrdersForInvoiceDtoByOrders } from './getOrdersForInvoiceDtoByOrders'
import { OrderInPaymentInvoice } from '../../domain/paymentInvoice/orderInPaymentInvoice'
import { AgreementService } from '../../services'

class PaymentInvoiceRepository {
  async getInvoiceById(id: string): Promise<PaymentInvoiceDomain | null> {
    const data: PaymentInvoiceDomain | null =
      await PaymentInvoiceModel.findById(id).lean()
    if (!data || !data._id) return null

    // const agreement = await AgreementService.getById(
    //   data.agreementId.toString()
    // )

    const orders = await this.getOrdersPickedForInvoice({
      paymentInvoiceId: data._id.toString(),
    })
    const paymentInvoice = PaymentInvoiceDomain.create(data, orders)
    // paymentInvoice.setAgreement(agreement)
    return paymentInvoice
  }

  async updateInvoice(id: string, body: any): Promise<PaymentInvoiceDomain> {
    const paymentInvoice = await PaymentInvoiceModel.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).lean()

    if (!paymentInvoice)
      throw new Error(
        'PaymentInvoiceRepository : updateInvoice : payment invoice not found'
      )
    return PaymentInvoiceDomain.create(paymentInvoice)
  }

  async updateOrdersInPaymentInvoce(
    items: OrderInPaymentInvoice[]
  ): Promise<void> {
    const makeOperation = (filter: object, update: object) => ({
      updateOne: { filter, update, upsert: false },
    })

    await OrderInPaymentInvoiceModel.bulkWrite(
      items.map((i) => makeOperation({ order: i.order }, i))
    )
  }

  async addOrdersToInvoice(items: OrderInPaymentInvoice[]): Promise<void> {
    await OrderInPaymentInvoiceModel.create(items)
  }

  async pickOrdersForPaymentInvoice(
    params: IPickOrdersForPaymentInvoiceProps
  ): Promise<OrderPickedForInvoiceDTO[]> {
    return await pickOrdersForPaymentInvoice(params)
  }

  async getOrdersPickedForInvoice(
    params: IGetOrdersForPaymentInvoiceProps
  ): Promise<OrderPickedForInvoiceDTO[]> {
    return await getOrdersForPaymentInvoice(params)
  }

  async getOrdersForInvoiceDtoByOrders(
    orders: string[],
    company: string
  ): Promise<OrderPickedForInvoiceDTO[]> {
    return await getOrdersForInvoiceDtoByOrders(orders, company)
  }

  async getOrderInPaymentInvoiceItemsByOrders(
    orders: string[]
  ): Promise<OrderInPaymentInvoice[]> {
    if (!orders || !Array.isArray(orders))
      throw new Error(
        'PaymentInvoiceRepository : getOrderInPaymentInvoiceItemsByOrders : args error - orders is missing!'
      )

    const items: OrderInPaymentInvoice[] =
      await OrderInPaymentInvoiceModel.find<OrderInPaymentInvoice>({
        order: orders,
      }).lean()
    return items.map((i) => new OrderInPaymentInvoice(i))
  }
}

export default new PaymentInvoiceRepository()
