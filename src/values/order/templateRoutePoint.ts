import mongoose from 'mongoose'
import { POINT_TYPE_VALUES, POINT_TYPES_ENUM } from '../../constants/enums'
import { convertTimeToHours } from '../../utils/convertTimeToHours'

export interface ITemplateRoutePoint {
  type: POINT_TYPES_ENUM
  address: string
  fixedTime: string | number | null
  hoursInterval: number
  useInterval: boolean
  offsetDays?: number
  note?: string
  get hasFixedTime(): boolean
  isMainLoadingPoint?: boolean
}

function setFixedTime(
  time: string | number | null | undefined = null
): number | null {
  if (!time) return null
  if (typeof time === 'string') return convertTimeToHours(time)
  return time
}

export class TemplateRoutePoint implements ITemplateRoutePoint {
  type: POINT_TYPES_ENUM
  address: string
  fixedTime: string | number | null
  hoursInterval: number = 0
  useInterval: boolean = false
  offsetDays?: number = 0
  note?: string
  isMainLoadingPoint: boolean = false

  constructor(point: ITemplateRoutePoint) {
    this.type = point.type
    this.address = point.address
    this.fixedTime = setFixedTime(point.fixedTime)
    this.hoursInterval = point.hoursInterval
    this.useInterval = point.useInterval
    this.offsetDays = point.offsetDays
    this.note = point.note
    this.isMainLoadingPoint = Boolean(point.isMainLoadingPoint)
  }

  get hasFixedTime() {
    return this.fixedTime !== null
  }

  static getDbSchema(): object {
    return {
      type: { type: String, enum: POINT_TYPE_VALUES },
      address: { type: mongoose.Types.ObjectId, ref: 'Address' },
      fixedTime: String,
      hoursInterval: { type: Number, min: 0, default: 0 },
      useInterval: { type: Boolean, default: false },
      isMainLoadingPoint: { type: Boolean, default: false },
      offsetDays: Number,
      note: String,
    }
  }
}
