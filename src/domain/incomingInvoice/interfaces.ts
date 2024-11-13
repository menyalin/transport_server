import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'
import { PriceByType, TotalPrice } from '../commonInterfaces'

export interface IIncomingInvoiceOrderConstructorProps {
  order: string
  incomingInvoice: string
  company: string
  total: TotalPrice
  totalByTypes: Record<ORDER_PRICE_TYPES_ENUM, PriceByType>
}
