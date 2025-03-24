export interface ITitleRowFragmentProps {
  number: string
  date: Date
}

export interface IHeaderTableFragmentProps {
  executor: any
  customer: any
  basis: string
}

export interface IMainTableRowFragmentProps {
  title: string
  count: string
  measurementUnit: string
  price: string
  sum: string
}

export interface IMainTableResultFragmentProps {
  priceWOVat: number
  vatRate: number
  priceWithVat: number
  ordersCount: number
}

export interface IMainTableFragmentProps {
  rows: IMainTableRowFragmentProps[]
}

export interface ISignatoriesFragmentProps {}

export interface ICommonActIncomingInvoiceData {
  titleData: ITitleRowFragmentProps
  headerTable: IHeaderTableFragmentProps
  mainTable: IMainTableFragmentProps
  resultTable: IMainTableResultFragmentProps
  signatories: ISignatoriesFragmentProps
  description: string
}
