import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'
import {
  PriceByType,
  PriceByTypeSchema,
  TotalPrice,
  TotalPriceSchema,
} from '../commonInterfaces'
import { Types } from 'mongoose'
import { Order } from '../order/order.domain'
import { IIncomingInvoiceOrderConstructorProps } from './interfaces'
import { z } from 'zod'

export class IncomingInvoiceOrder {
  order: string
  incomingInvoice: string
  company: string
  total: TotalPrice
  totalByTypes: Record<ORDER_PRICE_TYPES_ENUM, PriceByType>

  constructor(p: IIncomingInvoiceOrderConstructorProps) {
    this.order = p.order.toString()
    this.incomingInvoice = p.incomingInvoice.toString()
    this.company = p.company.toString()
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
  static get validationSchema() {
    return z.object({
      order: z.string(),
      incomingInvoice: z.string(),
      company: z.string(),
      total: TotalPriceSchema,
      totalByTypes: z.record(z.string(), PriceByTypeSchema),
    })
  }
  static get dbSchema() {
    const PriceTypeSchema = {
      price: Number,
      priceWOVat: Number,
    }

    return {
      order: { type: Types.ObjectId, unique: true, index: true },
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
