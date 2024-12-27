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
  distanceRoad: number | null
  distanceDirect: number | null
  loadingZones?: string[]
  unloadingZones?: string[]
  routeStats?: RouteStats

  constructor(props: Props) {
    const p = OrderAnalytics.validationSchema.parse(props)
    this.type = p.type
    this.distanceDirect = p.distanceDirect
    this.distanceRoad = p.distanceRoad
    this.loadingZones = p.loadingZones ? p.loadingZones : undefined
    this.unloadingZones = p.unloadingZones ? p.unloadingZones : undefined

    if (props.route) this.routeStats = new RouteStats(props.route)
    else if (props.routeStats) this.routeStats = props.routeStats
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
      type: z
        .string()
        .nullable()
        .transform((val) => (val as OrderType) ?? 'region'),
      distanceRoad: z.number().nullable().optional().default(0),
      distanceDirect: z.number().nullable().optional().default(0),
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
