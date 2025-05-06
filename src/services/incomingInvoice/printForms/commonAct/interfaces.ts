import {
  ICommonDocMainTableProps,
  ICommonDocPaymentResultProps,
} from '@/shared/printForms/interfaces'
import {
  ICommonDocHeaderTableProps,
  ICommonTitleRowProps,
} from '@/shared/printForms/interfaces'

export interface ISignatoriesFragmentProps {
  executorSignatoryPosition: string
  executorSignatoryName: string
  executorCompanyName: string
  customerCompanyName: string
}

export interface ICommonActIncomingInvoiceData {
  titleData: ICommonTitleRowProps
  headerTable: ICommonDocHeaderTableProps
  mainTable: ICommonDocMainTableProps
  resultTable: ICommonDocPaymentResultProps
  signatories: ISignatoriesFragmentProps
  description: string
}
