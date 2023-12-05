import { Types } from 'mongoose'
import { ICreateOrderInPaymentInvoiceProps, IPrice } from './interfaces'
import { OrderPickedForInvoiceDTO } from './dto/orderPickedForInvoice.dto'

const PriceType = {
  price: Number,
  priceWOVat: Number,
}

export class OrderInPaymentInvoice {
  order: string
  paymentInvoice: string
  company: string
  itemType: string
  total: IPrice
  totalByTypes: { [key: string]: IPrice }

  constructor(p: any) {
    this.order = p.order
    this.company = p.company
    this.paymentInvoice = p.paymentInvoice
    this.itemType = p.itemType
    this.total = p.total
    this.totalByTypes = p.totalByTypes
  }

  public setTotal(order: OrderPickedForInvoiceDTO): void {
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
    })
  }

  static dbSchema = {
    order: { type: Types.ObjectId, unique: true }, // orderID or paymentPartId
    paymentInvoice: {
      type: Types.ObjectId,
      ref: 'PaymentInvoice',
      required: true,
    },
    company: { type: Types.ObjectId, ref: 'Company' },
    itemType: { type: String, enum: ['order', 'paymentPart'] },
    total: PriceType,
    totalByTypes: {
      type: Map,
      of: PriceType,
    },
  }
}
