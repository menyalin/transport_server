import { OrderPickedForInvoiceDTO } from '../../domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import {
  GetOrdersPickedForInvoiceProps,
  IPickOrdersForPaymentInvoiceProps,
  IStaticticData,
} from '../../domain/paymentInvoice/interfaces'
import { PaymentInvoiceDomain } from '../../domain/paymentInvoice/paymentInvoice'
import {
  PaymentInvoice as PaymentInvoiceModel,
  OrderInPaymentInvoice as OrderInPaymentInvoiceModel,
} from '../../models'
import { pickOrdersForPaymentInvoice } from './pickOrdersForPaymentInvoice'
import { OrderInPaymentInvoice } from '../../domain/paymentInvoice/orderInPaymentInvoice'
import { getOrdersPickedForInvoice } from './getOrdersPickedForInvoice'
import { getOrdersPickedForInvoiceDTOByOrders } from './getOrdersPickedForInvoiceDTOByOrders'
class PaymentInvoiceRepository {
  async getInvoiceById(id: string): Promise<PaymentInvoiceDomain | null> {
    const invoice: PaymentInvoiceDomain | null =
      await PaymentInvoiceModel.findById(id).lean()
    if (!invoice || !invoice._id) return null

    const orders = await this.getOrdersPickedForInvoice({
      invoiceId: invoice._id.toString(),
      company: invoice.company.toString(),
    })
    const paymentInvoice = PaymentInvoiceDomain.create(invoice, orders)

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
  ): Promise<[OrderPickedForInvoiceDTO[], IStaticticData]> {
    return await pickOrdersForPaymentInvoice(params)
  }

  async getOrdersPickedForInvoiceDTOByOrders(
    p: GetOrdersPickedForInvoiceProps
  ): Promise<OrderPickedForInvoiceDTO[]> {
    return await getOrdersPickedForInvoiceDTOByOrders(p)
  }

  async getOrdersPickedForInvoice(
    params: GetOrdersPickedForInvoiceProps
  ): Promise<OrderPickedForInvoiceDTO[]> {
    return await getOrdersPickedForInvoice(params)
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
