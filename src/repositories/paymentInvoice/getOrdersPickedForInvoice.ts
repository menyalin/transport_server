import { PipelineStage, Types } from 'mongoose'
import { OrderPickedForInvoiceDTO } from '../../domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import { OrderInPaymentInvoice as OrderInPaymentInvoiceModel } from '../../models'
import { lookupOrdersForOrderInInvoice } from './pipelineFragments/lookupOrdersForOrderInInvoice'
import {
  GetOrdersPickedForInvoiceProps,
  GetOrdersPickedForInvoicePropsSchema,
} from '../../domain/paymentInvoice/interfaces'

export async function getOrdersPickedForInvoice(
  p: GetOrdersPickedForInvoiceProps
): Promise<OrderPickedForInvoiceDTO[]> {
  GetOrdersPickedForInvoicePropsSchema.parse(p)

  const firstMatcher: PipelineStage.Match = {
    $match: {
      company: new Types.ObjectId(p.company),
      $expr: {
        $and: [],
      },
    },
  }
  if (p.invoiceId)
    firstMatcher.$match.$expr?.$and.push({
      $eq: ['$paymentInvoice', new Types.ObjectId(p.invoiceId)],
    })
  else if (p.orderIds?.length)
    firstMatcher.$match.$expr?.$and.push({
      $in: ['$order', p.orderIds.map((i) => new Types.ObjectId(i))],
    })

  const res = await OrderInPaymentInvoiceModel.aggregate([
    firstMatcher,
    ...lookupOrdersForOrderInInvoice(),
  ])

  return res.map((i) => new OrderPickedForInvoiceDTO(i))
}
