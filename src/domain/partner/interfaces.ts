import { Types } from 'mongoose'
import { IdleTruckNotification } from './idleTruckNotification'
import { RoutePoint } from '../order/route/routePoint'

// export enum USE_TRUCK_FILTER_ENUM {
//   included = 'included',
//   excluded = 'excluded',
//   notUsed = 'notUsed',
// }

export interface IIdleTruckNotifyProps {
  _id?: string
  title: string
  agreement?: string | null
  addresses?: string[]
  emails: string
  ccEmails?: string
  bccEmails?: string
  idleHoursBeforeNotify?: number
  templateName: string
  note?: string
  usePlannedDate?: boolean
  isActive: boolean
}

export interface INotificationsByRouteRes {
  notification: IdleTruckNotification
  point: RoutePoint
}

export interface ILoadingDockProps {
  _id?: Types.ObjectId | string
  title: string
  address: string
  allowedLoadingPoints?: string[]
  contacts?: string
  note?: string
  resctrictAddresses?: boolean
}
