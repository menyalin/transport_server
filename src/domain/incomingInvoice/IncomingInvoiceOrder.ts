import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'
import { PriceByType, TotalPrice } from '../commonInterfaces'
import { Types } from 'mongoose'
import { Order } from '../order/order.domain'

export class IncomingInvoiceOrder {
  order: string
  incomingInvoice: string
  company: string
  total: TotalPrice
  totalByTypes: Record<ORDER_PRICE_TYPES_ENUM, PriceByType>

  constructor(p: any) {
    this.order = p.order
    this.incomingInvoice = p.incomingInvoice
    this.company = p.company
    this.total = p.total
    this.totalByTypes = p.totalByTypes
  }
  static create(order: Order, invoiceId: string) {
    return new IncomingInvoiceOrder({
      order: order._id,
      incomingInvoice: invoiceId,
      company: order.company.toString(),
      total: order.totalOutsourceCosts,
      totalByTypes: order.totalOutsourceCostsByTypes,
    })
  }

  static get dbSchema() {
    const PriceTypeSchema = {
      price: Number,
      priceWOVat: Number,
    }

    return {
      order: { type: Types.ObjectId, unique: true }, // orderID or paymentPartId
      incomingInvoice: {
        type: Types.ObjectId,
        ref: 'IncomingInvoice',
        required: true,
      },
      company: { type: Types.ObjectId, ref: 'Company' },
      total: PriceTypeSchema,
      totalByTypes: { type: Map, of: PriceTypeSchema },
    }
  }
}
