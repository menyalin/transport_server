export interface ICommonTitleRowProps {
  docName: string
  number: string
  date: Date
}

export interface ICommonDocHeaderTableProps {
  executorTitle: string
  executor: string
  customerTitle: string
  customer: string
  basis: string
}

export interface ICommonDocMainTableRowProps {
  title: string
  count: string
  measurementUnit: string
  price: string
  sum: string
}

export interface ICommonDocMainTableProps {
  rows: ICommonDocMainTableRowProps[]
  mainColumnTitle: string
}

export interface ICommonDocPaymentResultProps {
  priceWOVat: number
  vatRate: number
  priceWithVat: number
  count: number
  showTotalToPay: boolean
  serviceTitle: string // Для строки с итогами
}
