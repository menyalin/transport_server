import { Types, Schema } from 'mongoose'
import {
  ICreateOrderInPaymentInvoiceProps,
  ILoaderData,
  PriceByType,
  TotalPrice,
} from './interfaces'
import { OrderPickedForInvoiceDTO } from './dto/orderPickedForInvoice.dto'
import { ORDER_PRICE_TYPES_ENUM } from '../../constants/priceTypes'

export class OrderInPaymentInvoice {
  order: string
  paymentInvoice: string
  company: string
  itemType: string
  total: TotalPrice
  totalByTypes: Record<ORDER_PRICE_TYPES_ENUM, PriceByType>
  loaderData: ILoaderData

  constructor(p: any) {
    this.order = p.order
    this.company = p.company
    this.paymentInvoice = p.paymentInvoice
    this.itemType = p.itemType
    this.total = p.total
    this.totalByTypes = p.totalByTypes
    this.loaderData = p.loaderData
  }

  setTotal(order: OrderPickedForInvoiceDTO): void {
    this.total = order.total
    this.totalByTypes = order.totalByTypes
  }

  static create({
    order,
    invoiceId,
  }: ICreateOrderInPaymentInvoiceProps): OrderInPaymentInvoice {
    if (!invoiceId)
      throw new Error('OrderInPaymentInvoice domain : invoice._id  is missing')

    return new OrderInPaymentInvoice({
      order: order._id,
      paymentInvoice: invoiceId,
      company: order.company.toString(),
      itemType: order.itemType || 'order',
      total: order.total,
      totalByTypes: order.totalByTypes,
      loaderData: order.loaderData,
    })
  }

  static get dbSchema() {
    const PriceTypeSchema = {
      price: Number,
      priceWOVat: Number,
    }

    return {
      order: { type: Types.ObjectId, unique: true }, // orderID or paymentPartId
      paymentInvoice: {
        type: Types.ObjectId,
        ref: 'PaymentInvoice',
        required: true,
      },
      company: { type: Types.ObjectId, ref: 'Company' },
      itemType: { type: String, enum: ['order', 'paymentPart'] },
      total: PriceTypeSchema,
      totalByTypes: {
        type: Map,
        of: PriceTypeSchema,
      },
      loaderData: Schema.Types.Mixed,
    }
  }
}
