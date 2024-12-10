import { ICarreierPFData } from '@/domain/carrier/interfaces'
import { IRoutePointPFData } from '@/domain/order/route/interfaces'

export interface ICargoInfoProps {
  description?: string | null
  plt?: number | null
  volume?: number | null
  weight?: number | null
  note?: string | null
  truckType?: string | null
  tRegime?: string | null
}

export interface IHeaderInfoProps {
  num: string
  date: string
  customer: string
  carrier: string
}

export interface IDriverInfoProps {
  fullName: string
  passport: string
  phone: string
  tsRegNum: string
}

export interface IPaymentInfoProps {
  paymentSum: number
  paymentDescription: string
}

export interface ICommonOrderContractProps {
  headerInfo: IHeaderInfoProps
  cargoInfo: ICargoInfoProps
  route: IRoutePointPFData[]
  driverInfo: IDriverInfoProps
  paymentInfo: IPaymentInfoProps
  notes: string[]
  customer: ICarreierPFData
  carrier: ICarreierPFData
}
