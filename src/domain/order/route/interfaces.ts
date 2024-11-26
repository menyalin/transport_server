import { POINT_TYPES_ENUM } from '@/constants/enums'

export interface IRoutePointPFData {
  address: string
  pointType: POINT_TYPES_ENUM
  useInterval: boolean
  plannedDateTime?: string
  partnerName?: string
  intervalEndDate?: string
  note?: string
}
