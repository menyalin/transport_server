// @ts-nocheck
import mongoose from 'mongoose'
import { RouteStats } from '../../values/order/routeStats.js'
import { Order as OrderDomain } from '../order/order.domain.js'
import { InvoiceStats } from '../../values/order/invoiceStats.js'

export class OrderStats {
  constructor(order) {
    if (!order || !order instanceof OrderDomain)
      throw new Error('OrderStatsService : updateRoute : invalid order')
    this.orderId = order._id.toString()
    this.company = order.company.toString()
    this.orderDate = this.orderDate
    this.route = new RouteStats(order.route)
  }

  static getDbSchema() {
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
      route: RouteStats.getDbSchema(),
      invoice: InvoiceStats.getDbSchema(),
    }
  }
}
