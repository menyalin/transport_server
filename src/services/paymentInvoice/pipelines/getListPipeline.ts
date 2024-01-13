import { PipelineStage, Types } from 'mongoose'
import { PAIMENT_INVOICE_STATUSES } from '../../../constants/paymentInvoice'
import { BadRequestError } from '../../../helpers/errors'
import { z } from 'zod'
import { DateRange } from '../../../classes/dateRange'

interface IProps {
  period: string[]
  company: string
  limit: string
  skip: string
  status?: string
  search?: string
  agreements?: string[]
}
const IPropsSchema = z.object({
  period: z.array(z.string().datetime()).length(2),
  company: z.string(),
  limit: z.string().optional(),
  skip: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  agreements: z.array(z.string()).optional(),
})

export const getListPipeline = (p: IProps): PipelineStage[] => {
  IPropsSchema.parse(p)
  const period = new DateRange(p.period[0], p.period[1])
  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      company: new Types.ObjectId(p.company),
      $expr: {
        $and: [
          { $gte: ['$sendDate', period.start] },
          { $lte: ['$sendDate', period.end] },
        ],
      },
    },
  }

  if (p.search) {
    firstMatcher.$match.$expr.$and.push({
      $or: [
        { $regexMatch: { input: '$number', regex: p.search, options: 'i' } },
      ],
    })
  }

  if (p.agreements && p.agreements.length) {
    firstMatcher.$match.$expr.$and.push({
      $in: ['$agreement', p.agreements.map((i) => new Types.ObjectId(i))],
    })
  }
  if (p.status)
    firstMatcher.$match.$expr.$and.push({ $eq: ['$status', p.status] })

  const group: PipelineStage[] = [
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: 'paymentInvoices',
        items: { $push: '$$ROOT' },
      },
    },
    {
      $addFields: {
        count: { $size: '$items' },
        items: { $slice: ['$items', +p.skip, +p.limit] },
      },
    },
  ]
  const clientLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'partners',
        localField: 'client',
        foreignField: '_id',
        as: '_client',
      },
    },
    { $addFields: { _client: { $first: '$_client' } } },
  ]

  const agreementLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'agreement',
        foreignField: '_id',
        as: 'agreement',
      },
    },
    { $addFields: { agreement: { $first: '$agreement' } } },
  ]

  const additionalFields = [
    {
      $addFields: {
        clientName: '$_client.name',
        agreementName: '$agreement.name',
        statusStr: {
          $switch: {
            branches: PAIMENT_INVOICE_STATUSES.map((i) => ({
              case: { $eq: ['$status', i.value] },
              then: i.text,
            })),
            default: 'unexpected status',
          },
        },
      },
    },
  ]

  const priceLookup = [
    {
      $lookup: {
        from: 'ordersInPaymentInvoices',
        localField: '_id',
        foreignField: 'paymentInvoice',
        as: '_orders',
      },
    },
    {
      $addFields: {
        total: {
          $reduce: {
            initialValue: { price: 0, priceWOVat: 0 },
            input: '$_orders',
            in: {
              price: { $add: ['$$this.total.price', '$$value.price'] },
              priceWOVat: {
                $add: ['$$this.total.priceWOVat', '$$value.priceWOVat'],
              },
            },
          },
        },
        count: {
          $size: {
            $filter: {
              input: '$_orders',
              cond: { $ne: ['$$this.itemType', 'paymentPart'] },
            },
          },
        },
      },
    },
  ]

  const pipeline = [
    firstMatcher,
    ...clientLookup,
    ...agreementLookup,
    ...additionalFields,
    ...priceLookup,
  ]

  return [...pipeline, ...group]
}
