import z from 'zod'
import { Types } from 'mongoose'
import { DateRange } from '../../classes/dateRange'
import { OrderPickedForInvoiceDTO } from './dto/orderPickedForInvoice.dto'
import { OrderPaymentPartPropsSchema } from '../order/paymentPart'
import { objectIdSchema } from '@/shared/validationSchemes'
import { PriceByTypeSchema, TotalPriceSchema } from '../commonInterfaces'
import { ORDER_DOC_STATUSES_ENUM } from '@/constants/orderDocsStatus'

export const PickOrdersForPaymentInvoicePropsSchema = z.object({
  company: z.string(),
  period: DateRange.validationSchema,
  client: z.string().optional(),
  agreement: z.string().optional(),
  agreements: z.string().array().optional(),
  tks: z.string().array().optional(),
  paymentInvoiceId: z.string().optional(),
  docStatuses: z.array(z.nativeEnum(ORDER_DOC_STATUSES_ENUM)).optional(),
  onlySelectable: z.boolean().optional(),
  truck: z.string().optional(),
  driver: z.string().optional(),
  loadingZone: z.string().optional(),
  loadingZones: z.array(z.string()).optional(),
  search: z.string().optional(),
  numbers: z.array(z.string()).optional(),
  limit: z.number().int().optional(),
  skip: z.number().int().optional(),
  sortBy: z.string().array().optional(),
  sortDesc: z.boolean().array().optional(),
})

export type IPickOrdersForPaymentInvoiceProps = z.infer<
  typeof PickOrdersForPaymentInvoicePropsSchema
>

export interface IStaticticData {
  count: number
  total: any
}

export interface IAddOrdersToInvoiceProps {
  company: string
  orders: string[]
  paymentInvoiceId: string
  registryData?: ILoaderData[]
}

export const GetOrdersPickedForInvoicePropsSchema = z
  .object({
    company: z.string(),
    invoiceId: z.string().optional(),
    orderIds: z.array(z.string()).optional(),
  })
  .refine((data) => (data.invoiceId ? !data.orderIds : data.orderIds), {
    message:
      'GetOrdersPickedForInvoicePropsSchema: Either invoiceId or orderIds must be provided, but not both',
  })

export type GetOrdersPickedForInvoiceProps = z.infer<
  typeof GetOrdersPickedForInvoicePropsSchema
>

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

export const orderPickedForInvoiceDTOSchema = z
  .object({
    _id: z.union([z.string(), z.instanceof(Types.ObjectId)]),
    client: z.unknown(),
    company: z.union([z.string(), z.instanceof(Types.ObjectId)]),
    prePrices: z.array(PriceByTypeSchema).optional(),
    prices: z.array(PriceByTypeSchema).optional(),
    finalPrices: z.array(PriceByTypeSchema).optional(),
    state: z.unknown(),
    plannedDate: z.instanceof(Date),
    orderId: z.union([z.string(), z.instanceof(Types.ObjectId)]),
    isSelectable: z.boolean().optional(),
    agreementVatRate: z.number(),
    paymentPartsSumWOVat: z.number(),
    reqTransport: z.unknown(),
    confirmedCrew: z.object({
      truck: objectIdSchema.optional().nullable(),
      trailer: objectIdSchema.optional().nullable(),
      driver: objectIdSchema.optional().nullable(),
      outsourceAgreement: objectIdSchema.optional().nullable(),
      tkName: objectIdSchema.optional().nullable(),
    }),
    route: z.array(z.unknown()),
    analytics: z
      .object({
        type: z.string(),
        distanceRoad: z.number(),
        distanceDirect: z.number(),
      })
      .optional(),
    docs: z.array(z.unknown()).optional(),
    docNumbers: z.string().optional(),
    docsState: z
      .object({
        getted: z.union([z.boolean(), z.null()]).optional(),
        date: z.union([z.instanceof(Date), z.null()]).optional(),
      })
      .optional(),

    paymentParts: OrderPaymentPartPropsSchema.optional(),
    paymentToDriver: z.unknown(),
    note: z.string().nullable().optional(),
    paymentInvoices: z.array(z.unknown()).optional(),
    agreement: z.unknown().optional(),
    _loadingZones: z
      .array(
        z.object({
          _id: objectIdSchema,
          name: z.string(),
          priority: z.number().optional(),
        })
      )
      .optional(),
    // total: TotalPriceSchema,
    // totalByTypes: z.record(PriceByTypeSchema).optional(),
    savedTotal: TotalPriceSchema.optional(),
    savedTotalByTypes: z.record(PriceByTypeSchema).optional(),
    driverName: z.string().optional(),
    // needUpdate: z.boolean().optional(),
    itemType: z.string(),
    rowId: z.unknown().optional(),
    loaderData: LoaderDataSchema.optional(),
    // need remove
    _total: z.number().optional(),
    _totalWOVat: z.number().optional(),
  })
  .refine(() => true, {
    message: 'orderPickedForInvoiceDTOSchema error',
  })

export type OrderPickedForInvoiceDTOProps = z.infer<
  typeof orderPickedForInvoiceDTOSchema
>
