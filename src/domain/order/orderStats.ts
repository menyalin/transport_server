import mongoose from 'mongoose'

import { Order as OrderDomain } from '../order/order.domain'
import { InvoiceStats } from '../../values/order/invoiceStats'
import { RouteStats } from './route/routeStats'

export class OrderStats {
  orderId: string
  company: string
  orderDate: Date
  route: RouteStats
  invoice?: InvoiceStats

  constructor(order: OrderDomain) {
    if (!order || !(order instanceof OrderDomain))
      throw new Error('OrderStatsService : updateRoute : invalid order')
    this.orderId = order.id
    this.company = order.company
    this.orderDate = order.orderDate
    this.route = new RouteStats(order.route)
  }

  setInvoiceStats(): void {}

  static get dbSchema() {
    return {
      orderId: {
        type: mongoose.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true,
      },
      orderDate: { type: Date, required: true },
      company: {
        ref: 'Company',
        type: mongoose.Types.ObjectId,
        required: true,
      },
      route: RouteStats.dbSchema,
      invoice: InvoiceStats.dbSchema,
    }
  }
}
