import z from 'zod'
import { DateRange } from '../../classes/dateRange'
import { OrderPickedForInvoiceDTO } from './dto/orderPickedForInvoice.dto'

export const PickOrdersForPaymentInvoicePropsSchema = z.object({
  company: z.string(),
  period: DateRange.validationSchema,
  client: z.string().optional(),
  agreement: z.string().optional(),
  paymentInvoiceId: z.string().optional(),
  docStatus: z.string().optional(),
  onlySelectable: z.boolean().optional(),
  truck: z.string().optional(),
  driver: z.string().optional(),
  loadingZone: z.string().optional(),
  search: z.string().optional(),
  numbers: z.array(z.string()).optional(),
  limit: z.number().int().positive().optional(),
})
export type IPickOrdersForPaymentInvoiceProps = z.infer<
  typeof PickOrdersForPaymentInvoicePropsSchema
>

export interface IAddOrdersToInvoiceProps {
  company: string
  orders: string[]
  paymentInvoiceId: string
  registryData?: ILoaderData[]
}

export interface IGetOrdersForPaymentInvoiceProps {
  paymentInvoiceId?: string
  orderIds?: string[]
}

export interface IPrice {
  price: number
  priceWOVat: number
}

export const LoaderDataSchema = z
  .object({
    _id: z.string(),
    loaderName: z.string().optional(),
  })
  .and(z.record(z.unknown()))
export type ILoaderData = z.infer<typeof LoaderDataSchema>

export interface ICreateOrderInPaymentInvoiceProps {
  order: OrderPickedForInvoiceDTO
  invoiceId: string
  loaderData?: ILoaderData
}
