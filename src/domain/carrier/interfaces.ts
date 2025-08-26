import { Types } from 'mongoose'
import { BankAccountInfo } from '../bankAccountInfo'

export interface ICarreierPFData {
  fullDataString: string
  fullName: string
  legalAddress: string
  inn: string
  kpp: string
  ogrn?: string
  ogrnip?: string
  signatoryPosition: string
  signatoryName: string
  bankInfo?: BankAccountInfo
}

export interface IAllowedCarrierAgreement {
  agreement: string | Types.ObjectId
  startDate: Date
  endDate?: Date | null
  note?: string | null
}
