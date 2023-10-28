export enum MESSAGE_STATUS_ENUM {
  created = 'created',
  canceled = 'canceled',
  sended = 'sended',
}

export interface IAuthProps {
  email: string
  token: string
}

export interface IDefaultIdleTruckNotification {
  to: string
  cc: string | null
  templateName?: string
  isLoading: boolean
  emailTitle: string
  orderNum: string | null
  routeAddressesString: string
  currentAddressString: string
  waybills: string
  companyName: string
  plannedDate: string
  fullDriverName: string
  driverPhones: string
  truckBrand: string
  truckNum: string
  trailerNum?: string
  showPointStatus: boolean
  currentStatus?: string
}

export interface IIdleTruckNotificationMessageProps {
  _id?: string
  orderId: string
  pointId: string
  notificationId: string
  key: string
  status: MESSAGE_STATUS_ENUM
  body: IDefaultIdleTruckNotification
  sendDate: Date
  sended?: Date[]
  createdAt?: Date
}
