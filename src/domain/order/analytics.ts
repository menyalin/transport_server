import z from 'zod'
import { Types } from 'mongoose'
import { ORDER_ANALYTIC_TYPES_ENUM } from '@/constants/order'
import { OrderType, OrderTypeSchema } from './types'
import { objectIdSchema } from '@/shared/validationSchemes'
import { Route } from './route/route'
import { RouteStats } from './route/routeStats'

interface Props {
  type: OrderType
  distanceRoad: number
  distanceDirect: number
  loadingZones?: string[]
  unloadingZones?: string[]
  route?: Route
  routeStats?: RouteStats
}

export class OrderAnalytics {
  type: OrderType
  distanceRoad: number
  distanceDirect: number
  loadingZones?: string[]
  unloadingZones?: string[]
  routeStats?: RouteStats

  constructor(p: Props) {
    OrderAnalytics.validationSchema.parse(p)
    this.type = p.type
    this.distanceDirect = p.distanceDirect
    this.distanceRoad = p.distanceRoad
    this.loadingZones = p.loadingZones ? p.loadingZones : undefined
    this.unloadingZones = p.unloadingZones ? p.unloadingZones : undefined

    if (p.route) this.routeStats = new RouteStats(p.route)
    else if (p.routeStats) this.routeStats = p.routeStats
  }

  static get dbSchema() {
    return {
      type: { type: String, enum: ORDER_ANALYTIC_TYPES_ENUM },
      distanceRoad: { type: Number },
      distanceDirect: { type: Number },
      loadingZones: [{ type: Types.ObjectId, ref: 'Zone' }],
      unloadingZones: [{ type: Types.ObjectId, ref: 'Zone' }],
      routeStats: RouteStats.dbSchema,
    }
  }
  static get validationSchema() {
    return z.object({
      type: OrderTypeSchema,
      distanceRoad: z.number().nonnegative(),
      distanceDirect: z.number().nonnegative(),
      loadingZones: z
        .array(objectIdSchema)
        .transform((val) => val.map((i) => i.toString()))
        .optional(),
      unloadingZones: z
        .array(objectIdSchema)
        .transform((val) => val.map((i) => i.toString()))
        .optional(),
      routeStats: z.unknown().optional(),
    })
  }
}
