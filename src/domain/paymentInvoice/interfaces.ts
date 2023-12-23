import { DateRange } from '../../classes/dateRange'
import { OrderPickedForInvoiceDTO } from './dto/orderPickedForInvoice.dto'

export interface IPickOrdersForPaymentInvoiceProps {
  company: string
  client: string
  agreement: string
  period: DateRange
  paymentInvoiceId?: string
  docStatus?: string
  onlySelectable?: boolean
  truck?: string
  driver?: string
  loadingZone?: string
  search?: string
  numbers?: string[]
}

export interface IAddOrdersToInvoiceProps {
  company: string
  orders: string[]
  paymentInvoiceId: string
}

export interface IGetOrdersForPaymentInvoiceProps {
  paymentInvoiceId?: string
  orderIds?: string[]
}

export interface IPrice {
  price: number
  priceWOVat: number
}
export interface ICreateOrderInPaymentInvoiceProps {
  order: OrderPickedForInvoiceDTO
  invoiceId: string
}
