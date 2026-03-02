import { PipelineStage, Types } from 'mongoose'
import { OrderInPaymentInvoice as OrderInPaymentInvoiceModel } from '../../models'

import {
  GetOrdersPickedForInvoiceProps,
  GetOrdersPickedForInvoicePropsSchema,
} from '@/domain/paymentInvoice/interfaces'
import { lookupOrdersForOrderInInvoice } from './pipelines/pipelineFragments/lookupOrdersForOrderInInvoice'
import { InvoiceOrdersResultDTO } from './dto/invoiceOrdersResult.dto'

export async function getOrdersPickedForInvoice(
  p: GetOrdersPickedForInvoiceProps
): Promise<InvoiceOrdersResultDTO> {
  const parsedProps = GetOrdersPickedForInvoicePropsSchema.parse(p)

  const limitFragmentBuilder = (
    limit?: number,
    skip?: number
  ): PipelineStage[] => {
    if (!limit) return []
    return [{ $skip: skip || 0 }, { $limit: limit }]
  }

  const firstMatcher: PipelineStage.Match = {
    $match: {
      company: new Types.ObjectId(parsedProps.company),
      $expr: {
        $and: [],
      },
    },
  }
  if (parsedProps.invoiceId)
    firstMatcher.$match.$expr?.$and.push({
      $eq: ['$paymentInvoice', new Types.ObjectId(parsedProps.invoiceId)],
    })
  else if (parsedProps.orderIds?.length)
    firstMatcher.$match.$expr?.$and.push({
      $in: ['$order', parsedProps.orderIds.map((i) => new Types.ObjectId(i))],
    })

  // const finalFacet: PipelineStage.Facet = {
  //   $facet: {
  //     total: [
  //       {
  //         $group: {
  //           _id: null,
  //           count: { $sum: 1 },
  //           withVat: { $sum: '$total.price' },
  //           woVat: { $sum: '$total.priceWOVat' },
  //         },
  //       },
  //     ],
  //     items: [
  //       { $skip: parsedProps?.skip || 0 },
  //       { $limit: parsedProps.limit || 50 },
  //     ],
  //   },
  // }

  const res = await OrderInPaymentInvoiceModel.aggregate([
    firstMatcher,
    ...limitFragmentBuilder(parsedProps.limit, parsedProps.skip),
    ...lookupOrdersForOrderInInvoice({
      vatRate: p.vatRate,
      usePriceWithVat: p.usePriceWithVat,
    }),
    // finalFacet,
  ])

  return new InvoiceOrdersResultDTO({ total: [], items: res || [] })
}
