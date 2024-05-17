import z from 'zod'
import { PipelineStage, Types } from 'mongoose'
import { DateRange } from '@/classes/dateRange'
import { orderDocNumbersStringFragment } from '@/shared/pipelineFragments/orderDocNumbersStringBuilder'
import { orderDocsStatusConditionBuilder } from '@/shared/pipelineFragments/orderDocsStatusConditionBuilder'
import { orderLoadingZoneFragmentBuilder } from '@/shared/pipelineFragments/orderLoadingZoneFragmentBuilder'

const getSortingStage = (
  sortBy: string[] = [],
  sortDesc: string[] = []
): PipelineStage.Sort => {
  if (!Array.isArray(sortBy) || !sortBy.length)
    return { $sort: { createdAt: -1 } }

  let result = {}

  sortBy.forEach((fieldName, idx) => {
    result = Object.assign(result, {
      [fieldName]: sortDesc[idx] === 'true' ? -1 : 1,
    })
  })

  return { $sort: result }
}

const IPropsValidator = z.object({
  profile: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  limit: z.string(),
  skip: z.string(),
  docStatuses: z.array(z.string()).optional(),
  invoiceStatus: z.string().optional(),
  clients: z.array(z.string()).optional(),
  agreements: z.array(z.string()).optional(),
  status: z.string().optional(),
  trucks: z.array(z.string()).optional(),
  accountingMode: z.string().optional(),
  driver: z.string().optional(),
  tkNames: z.array(z.string()).optional(),
  trailer: z.string().optional(),
  searchNum: z.string().optional(),
  loadingZones: z.array(z.string()).optional(),
  address: z.string().optional(),
  sortBy: z.array(z.string()).optional(),
  sortDesc: z.array(z.string()).optional(),
})

type IProps = z.infer<typeof IPropsValidator>

export const getOrderListPipeline = (p: IProps): PipelineStage[] => {
  IPropsValidator.parse(p)
  const period = new DateRange(p.startDate, p.endDate)

  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      company: new Types.ObjectId(p.profile),
      $expr: {
        $and: [
          { $gte: ['$startPositionDate', period.start] },
          { $lt: ['$startPositionDate', period.end] },
        ],
      },
    },
  }

  if (p?.agreements?.length)
    firstMatcher.$match.$expr.$and.push({
      $in: [
        '$client.agreement',
        p.agreements.map((i) => new Types.ObjectId(i)),
      ],
    })

  if (p.accountingMode)
    firstMatcher.$match.$expr.$and.push({
      $or: [
        { $eq: ['$state.status', 'inProgress'] },
        { $eq: ['$state.status', 'completed'] },
      ],
    })

  if (p.status && !p.accountingMode)
    firstMatcher.$match['state.status'] = p.status

  if (p?.clients?.length)
    firstMatcher.$match.$expr.$and.push({
      $in: ['$client.client', p.clients.map((i) => new Types.ObjectId(i))],
    })
  if (p.tkNames?.length)
    firstMatcher.$match.$expr.$and.push({
      $in: [
        '$confirmedCrew.tkName',
        p.tkNames.map((i) => new Types.ObjectId(i)),
      ],
    })

  if (p.trucks?.length)
    firstMatcher.$match.$expr.$and.push({
      $in: ['$confirmedCrew.truck', p.trucks.map((i) => new Types.ObjectId(i))],
    })

  if (p.trailer)
    firstMatcher.$match['confirmedCrew.trailer'] = new Types.ObjectId(p.trailer)
  if (p.address)
    firstMatcher.$match['route.address'] = new Types.ObjectId(p.address)

  const agreementLookup = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'client.agreement',
        foreignField: '_id',
        as: 'agreement',
      },
    },
    {
      $addFields: {
        agreement: {
          $first: '$agreement',
        },
      },
    },
  ]

  const addSortFields = [
    {
      $addFields: {
        plannedDate: {
          $getField: {
            field: 'plannedDate',
            input: { $first: '$route' },
          },
        },
        driver: '$confirmedCrew.driver',
        truck: '$confirmedCrew.truck',
        docNumbers: orderDocNumbersStringFragment({
          docsFieldName: '$docs',
          onlyForAddToRegistry: false,
        }),
      },
    },
  ]

  const loadingZoneLookup = orderLoadingZoneFragmentBuilder()

  if (p.driver)
    firstMatcher.$match['confirmedCrew.driver'] = new Types.ObjectId(p.driver)

  if (p.docStatuses?.length)
    firstMatcher.$match.$expr.$and.push({
      $or: p.docStatuses.map((docStatus) =>
        orderDocsStatusConditionBuilder(docStatus)
      ),
    })

  if (p.searchNum) {
    firstMatcher.$match.$expr.$and.push({
      $or: [
        {
          $regexMatch: {
            input: '$client.num',
            regex: p.searchNum,
            options: 'i',
          },
        },
        {
          $regexMatch: {
            input: '$client.auctionNum',
            regex: p.searchNum,
            options: 'i',
          },
        },
        {
          $gte: [
            {
              $size: {
                $filter: {
                  input: '$docs',
                  cond: {
                    $regexMatch: {
                      input: '$$this.number',
                      regex: p.searchNum,
                      options: 'i',
                    },
                  },
                },
              },
            },
            1,
          ],
        },
      ],
    })
  }

  const secondMatcher: PipelineStage.Match = {
    $match: {
      $expr: {
        $and: [],
      },
    },
  }

  if (p.loadingZones?.length) {
    secondMatcher.$match.$expr.$and.push({
      $or: p.loadingZones.map((zone) => ({
        $in: [new Types.ObjectId(zone), '$_loadingZoneIds'],
      })),
    })
  }

  const group: PipelineStage[] = [
    getSortingStage(p.sortBy, p.sortDesc),
    {
      $group: {
        _id: 'orders',
        items: {
          $push: '$$ROOT',
        },
      },
    },
    {
      $addFields: {
        acceptedDocs: {
          $size: {
            $filter: {
              input: '$items',
              cond: {
                ...orderDocsStatusConditionBuilder(
                  'accepted',
                  '$$this.docs',
                  '$$this.docsState.getted'
                ),
              },
            },
          },
        },
        needFixDocs: {
          $size: {
            $filter: {
              input: '$items',
              cond: {
                ...orderDocsStatusConditionBuilder(
                  'needFix',
                  '$$this.docs',
                  '$$this.docsState.getted'
                ),
              },
            },
          },
        },
        onCheckDocs: {
          $size: {
            $filter: {
              input: '$items',
              cond: {
                ...orderDocsStatusConditionBuilder(
                  'onCheck',
                  '$$this.docs',
                  '$$this.docsState.getted'
                ),
              },
            },
          },
        },
        missingDocs: {
          $size: {
            $filter: {
              input: '$items',
              cond: {
                ...orderDocsStatusConditionBuilder(
                  'missing',
                  '$$this.docs',
                  '$$this.docsState.getted'
                ),
              },
            },
          },
        },

        count: {
          $size: '$items',
        },
        items: {
          $slice: ['$items', +p.skip, +p.limit],
        },
      },
    },
  ]

  const paymentInvoiceLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'ordersInPaymentInvoices',
        let: { orderId: '$_id' },
        pipeline: [{ $match: { $expr: { $eq: ['$order', '$$orderId'] } } }],
        as: '_invoices',
      },
    },
    {
      $match: {
        $expr: {
          $eq: [
            { $size: '$_invoices' },
            p.invoiceStatus === 'included' ? 1 : 0,
          ],
        },
      },
    },
    {
      $unset: ['_invoices', 'agreements'],
    },
  ]

  let pipeline: PipelineStage[] = [
    firstMatcher,
    ...loadingZoneLookup,
    ...addSortFields,
    secondMatcher,
    ...agreementLookup,
  ]

  if (p.invoiceStatus) pipeline = [...pipeline, ...paymentInvoiceLookup]

  return [...pipeline, ...group]
}
