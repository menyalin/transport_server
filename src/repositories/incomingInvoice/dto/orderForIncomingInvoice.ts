import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'
import {
  PriceByType,
  PriceByTypeSchema,
  TotalPrice,
  TotalPriceSchema,
} from '@/domain/commonInterfaces'
import { objectIdSchema } from '@/shared/validationSchemes'
import { z } from 'zod'

export class OrderForIncomingInvoice {
  _id: string
  orderDate: Date
  clientNum: string
  carrierId: string
  carrierName: string
  truckId: string
  truckName: string
  driverId: string
  driverName: string
  clientName: string
  loadingAddress: string
  unloadingAddress: string
  docsGetted: boolean
  total: TotalPrice
  totalByTypes: Record<ORDER_PRICE_TYPES_ENUM, PriceByType>

  constructor(props: any) {
    const p = OrderForIncomingInvoice.validationSchema.parse(props)
    this._id = p._id.toString()
    this.orderDate = p.orderDate
    this.clientNum = p.clientNum
    this.carrierId = p.carrierId.toString()
    this.carrierName = p.carrierName
    this.truckId = p.truckId.toString()
    this.truckName = p.truckName
    this.driverId = p.driverId.toString()
    this.driverName = p.driverName
    this.clientName = p.clientName
    this.loadingAddress = p.loadingAddress
    this.unloadingAddress = p.unloadingAddress
    this.docsGetted = p.docsGetted
    this.total = p.total
    this.totalByTypes = p.totalByTypes
  }

  static get validationSchema() {
    return z.object({
      _id: objectIdSchema,
      orderDate: z.date(),
      clientNum: z.string(),
      carrierId: objectIdSchema,
      carrierName: z.string(),
      truckId: objectIdSchema,
      truckName: z.string(),
      driverId: objectIdSchema,
      driverName: z.string(),
      clientName: z.string(),
      loadingAddress: z.string(),
      unloadingAddress: z.string(),
      docsGetted: z.boolean(),
      total: TotalPriceSchema,
      totalByTypes: z.record(z.string(), PriceByTypeSchema),
    })
  }
}
