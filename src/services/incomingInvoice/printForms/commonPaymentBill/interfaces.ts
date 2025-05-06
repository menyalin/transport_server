import { CompanyInfo } from '@/domain/companyInfo'
import { BankAccountInfo } from '@/domain/bankAccountInfo'
import {
  ICommonDocHeaderTableProps,
  ICommonDocMainTableProps,
  ICommonDocPaymentResultProps,
  ICommonTitleRowProps,
} from '@/shared/printForms/interfaces'

export interface ISignatoriesTableProps {
  directorName: string
  accountantName: string
}

export interface IBankAccountTableProps {
  companyInfo: CompanyInfo
  bankInfo: BankAccountInfo
}

export interface ICommonPaymentBillData {
  titleData: ICommonTitleRowProps
  headerTable: ICommonDocHeaderTableProps
  mainTableData: ICommonDocMainTableProps
  resultTable: ICommonDocPaymentResultProps
  signatories: ISignatoriesTableProps
  description: string
  bankInfoTable: IBankAccountTableProps
}
