import { orderDateFragmentBuilder } from '@/shared/pipelineFragments/orderDateFragmentBuilder'
import { PipelineStage, Types } from 'mongoose'

export const getInvoiceOrdersPipeline = (
  invoiceId: string,
  limit = 100,
  skip = 0
): PipelineStage[] => {
  const firstMatcher: PipelineStage.Match = {
    $match: {
      incomingInvoice: new Types.ObjectId(invoiceId),
    },
  }

  const orderLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'orders',
        localField: 'order',
        foreignField: '_id',
        as: 'tmp_raw_order',
      },
    },
    {
      $addFields: {
        tmp_raw_order: { $first: '$tmp_raw_order' },
      },
    },
  ]
  const addFields: PipelineStage.AddFields = {
    $addFields: {
      orderDate: orderDateFragmentBuilder('tmp_raw_order.route'),
      orderNum: '$tmp_raw_order.client.num',
    },
  }
  const finalFacet: PipelineStage.Facet = {
    $facet: {
      totalCount: [{ $count: 'count' }],
      items: [{ $skip: skip }, { $limit: limit }],
    },
  }
  return [firstMatcher, ...orderLookup, addFields, finalFacet]
}
