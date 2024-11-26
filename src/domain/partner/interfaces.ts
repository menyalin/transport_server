import { PARTNER_GROUPS_ENUM } from '../../constants/partner'
import { Types } from 'mongoose'
import { LoadingDock } from './loadingDock.domain'
import { IdleTruckNotification } from './idleTruckNotification'
import { RoutePoint } from '../order/route/routePoint'

// export enum USE_TRUCK_FILTER_ENUM {
//   included = 'included',
//   excluded = 'excluded',
//   notUsed = 'notUsed',
// }

export interface IParterProps {
  name: string
  fullName?: string
  inn?: string
  company: string | Types.ObjectId
  contacts?: string
  group?: PARTNER_GROUPS_ENUM
  isClient?: boolean
  isService?: boolean
  isActive?: boolean
  placesForTransferDocs?: LoadingDock[]
  idleTruckNotifications?: IdleTruckNotification[]
  invoiceLoader?: string
}
export interface IPartnerWithIdProps extends IParterProps {
  _id: string | Types.ObjectId
}

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
  // useTruckFilter?: USE_TRUCK_FILTER_ENUM
  // trucks?: string[]
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
}
