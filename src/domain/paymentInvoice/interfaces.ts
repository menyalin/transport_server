import { DateRange } from '../../classes/dateRange'

export interface IPickOrdersForPaymentInvoiceProps {
  company: string
  client: string
  period: DateRange
  paymentInvoiceId: string
  docStatus: string
  onlySelectable: boolean
  truck: string
  driver: string
  loadingZone: string
  search: string
}

export interface IGetOrdersForPaymentInvoiceProps {
  paymentInvoiceId?: string
  orderIds?: string[]
}
