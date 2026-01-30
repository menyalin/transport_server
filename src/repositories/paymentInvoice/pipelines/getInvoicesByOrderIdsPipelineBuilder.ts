import { PipelineStage, Types } from 'mongoose'

export const getInvoicesByOrderIdsPipelineBuilder = (
  orderIds: string[]
): PipelineStage[] => [
  {
    $match: {
      $expr: {
        $in: ['$order', orderIds.map((i) => new Types.ObjectId(i))],
      },
    },
  },
  {
    $lookup: {
      from: 'paymentInvoices',
      localField: 'paymentInvoice',
      foreignField: '_id',
      as: 'invoice',
    },
  },
  {
    $addFields: {
      invoice: { $first: '$invoice' },
    },
  },
  {
    $replaceRoot: {
      newRoot: '$invoice',
    },
  },
]
