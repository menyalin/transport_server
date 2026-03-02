import { z } from 'zod'
import { PipelineStage, Types } from 'mongoose'
import { PAIMENT_INVOICE_STATUSES } from '@/constants/paymentInvoice'
import { DateRange } from '@/classes/dateRange'

interface IProps {
  period: string[]
  company: string
  limit: string
  skip: string
  statuses?: string[]
  search?: string
  agreements?: string[]
  sortBy?: string[]
  sortDesc?: string[]
}
const IPropsSchema = z.object({
  periodBy: z
    .string()
    .optional()
    .nullable()
    .default('date')
    .transform((v) => (v ? v : 'date')),
  period: z.array(z.string().datetime()).length(2),
  company: z.string(),
  limit: z.string().optional(),
  skip: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  agreements: z.array(z.string()).optional(),
  sortBy: z.array(z.string()).optional(),
  sortDesc: z.array(z.string()).optional(),
})

const listSortingFragment = (
  sortBy: string[] = [],
  sortDesc: string[] = []
): Record<string, 1 | -1> => {
  const fieldsMapper = new Map()
  fieldsMapper.set('number', 'number')
  fieldsMapper.set('date', 'date')
  fieldsMapper.set('sendDate', 'sendDate')
  fieldsMapper.set('plannedPayDate', 'plannedPayDate')
  fieldsMapper.set('total.price', 'total.price')
  fieldsMapper.set('total.priceWOVat', 'total.priceWOVat')
  fieldsMapper.set('createdAt', 'createdAt')

  if (sortBy.length === 0 || !fieldsMapper.has(sortBy[0]))
    return { createdAt: -1 }
  else
    return { [fieldsMapper.get(sortBy[0])]: sortDesc[0] === 'false' ? 1 : -1 }
}

export const getListPipeline = (p: IProps): PipelineStage[] => {
  const parsedProps = IPropsSchema.parse(p)
  const period = new DateRange(p.period[0], p.period[1])
  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      company: new Types.ObjectId(p.company),
      $expr: {
        $and: [
          { $gte: [`$${parsedProps.periodBy}`, period.start] },
          { $lte: [`$${parsedProps.periodBy}`, period.end] },
        ],
      },
    },
  }

  if (p.search) {
    firstMatcher.$match.$expr?.$and.push({
      $or: [
        { $regexMatch: { input: '$number', regex: p.search, options: 'i' } },
        {
          $regexMatch: {
            input: '$numberByClient',
            regex: p.search,
            options: 'i',
          },
        },
      ],
    })
  }

  if (p.agreements && p.agreements.length) {
    firstMatcher.$match.$expr?.$and.push({
      $in: ['$agreement', p.agreements.map((i) => new Types.ObjectId(i))],
    })
  }
  if (p.statuses?.length)
    firstMatcher.$match.$expr?.$and.push({ $in: ['$status', p.statuses] })

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
    { $addFields: { clientName: '$_client.name' } },
    { $unset: ['_client'] },
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
    { $addFields: { agreementName: '$agreement.name' } },
    { $unset: ['agreement'] },
  ]

  const additionalFields = [
    {
      $addFields: {
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

  // const priceLookup = [
  //   {
  //     $lookup: {
  //       from: 'ordersInPaymentInvoices',
  //       localField: '_id',
  //       foreignField: 'paymentInvoice',
  //       as: '_orders',
  //     },
  //   },
  //   {
  //     $addFields: {
  //       _orders: {
  //         $map: {
  //           input: '$_orders',
  //           as: 'order',
  //           in: {
  //             total: '$$order.total',
  //             itemType: '$$order.itemType',
  //           },
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $addFields: {
  //       total: {
  //         $reduce: {
  //           initialValue: { price: 0, priceWOVat: 0 },
  //           input: '$_orders',
  //           in: {
  //             price: { $add: ['$$this.total.price', '$$value.price'] },
  //             priceWOVat: {
  //               $add: ['$$this.total.priceWOVat', '$$value.priceWOVat'],
  //             },
  //           },
  //         },
  //       },
  //       count: {
  //         $size: {
  //           $filter: {
  //             input: '$_orders',
  //             cond: { $ne: ['$$this.itemType', 'paymentPart'] },
  //           },
  //         },
  //       },
  //     },
  //   },
  // ]

  const group: PipelineStage[] = [
    { $sort: listSortingFragment(p.sortBy, p.sortDesc) },
    {
      $facet: {
        items: [{ $skip: +p.skip }, { $limit: +p.limit }],
        res: [
          {
            $group: {
              _id: null,
              count: { $count: {} },
              routesCount: { $sum: '$ordersCount' },
              sum: { $sum: '$priceWithVat' },
              sumWOVat: { $sum: '$priceWOVat' },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        res: { $first: '$res' },
      },
    },
    {
      $project: {
        _id: 'paymentInvoice',
        items: 1,
        count: '$res.count',
        routesCount: '$res.routesCount',
        total: {
          sum: '$res.sum',
          sumWOVat: '$res.sumWOVat',
        },
      },
    },
  ]

  const pipeline = [
    firstMatcher,
    ...clientLookup,
    ...agreementLookup,
    ...additionalFields,
  ]

  return [...pipeline, ...group]
}
