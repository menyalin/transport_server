import { PipelineStage, Types } from 'mongoose'

export const invoiceAnalyticsPipelineBuilder = (
  invoiceId: string
): PipelineStage[] => [
  {
    $match: {
      paymentInvoice: new Types.ObjectId(invoiceId),
    },
  },
  {
    $group: {
      _id: '$paymentInvoice',
      priceWithVat: { $sum: '$total.price' },
      priceWOVat: { $sum: '$total.priceWOVat' },
      ordersCount: { $count: {} },
    },
  },
]
