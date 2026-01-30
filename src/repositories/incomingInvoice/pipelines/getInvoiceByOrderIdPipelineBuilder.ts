import { PipelineStage, Types } from 'mongoose'

export const getInvoiceByOrderIdPipelineBuilder = (
  orderId: string
): PipelineStage[] => {
  return [
    { $match: { order: new Types.ObjectId(orderId) } },
    {
      $lookup: {
        from: 'incomingInvoices',
        localField: 'incomingInvoice',
        foreignField: '_id',
        as: 'invoice',
      },
    },
    { $addFields: { invoice: { $first: '$invoice' } } },
    { $replaceRoot: { newRoot: '$invoice' } },
  ]
}
