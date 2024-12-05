import { z } from 'zod'
import { IRoutePointPFData } from '../route/interfaces'
import { POINT_TYPES_ENUM } from '@/constants/enums'

export class RoutePointPFDataDTO implements IRoutePointPFData {
  address: string
  pointType: POINT_TYPES_ENUM
  useInterval: boolean
  plannedDateTime?: string
  partnerName?: string
  intervalEndDate?: string
  note?: string

  constructor(props: unknown) {
    const p = RoutePointPFDataDTO.validationSchema.parse(props)
    this.address = p.address
    this.pointType = p.pointType
    this.useInterval = p.useInterval
    this.plannedDateTime = p.plannedDateTime ?? undefined
    this.partnerName = p.partnerName
    this.intervalEndDate = p.intervalEndDate ?? undefined
    this.note = p.note
  }

  static get validationSchema() {
    return z.object({
      address: z.string(),
      pointType: z.nativeEnum(POINT_TYPES_ENUM),
      useInterval: z.boolean(),
      plannedDateTime: z.string().optional().nullable(),
      partnerName: z.string().optional(),
      intervalEndDate: z.string().optional().nullable(),
      note: z.string().optional(),
    })
  }
}
