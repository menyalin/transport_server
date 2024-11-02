import z from 'zod'
import {
  ArrayExpressionOperator,
  BooleanExpression,
  PipelineStage,
  Types,
} from 'mongoose'

import {
  finalPricesWOVatFragmentBuilder,
  totalSumWOVatFragmentBuilder,
} from './pipelineFragments/orderFinalPricesFragmentBuilder'
import { OrderPickedForInvoiceDTO } from '@/domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import {
  IStaticticData,
  IPickOrdersForPaymentInvoiceProps,
  OrderPickedForInvoiceDTOProps,
} from '@/domain/paymentInvoice/interfaces'
import { OrderModel } from '@/models/order'
import { orderLoadingZoneFragmentBuilder } from '@/shared/pipelineFragments/orderLoadingZoneFragmentBuilder'
import { orderPlannedDateBuilder } from '@/shared/pipelineFragments/orderPlannedDateBuilder'
import { orderSearchByNumberFragmentBuilder } from '@/shared/pipelineFragments/orderSearchByNumberFragmentBuilder'
import { orderDocNumbersStringFragment } from '@/shared/pipelineFragments/orderDocNumbersStringBuilder'
import { orderDocsStatusConditionBuilder } from '@/shared/pipelineFragments/orderDocsStatusConditionBuilder'

const setStatisticData = (res: any): IStaticticData => {
  if (!res.total?.length)
    return {
      count: 0,
      total: {
        withVat: 0,
        woVat: 0,
      },
    }

  const schema = z.object({
    count: z.number(),
    total: z.object({ withVat: z.number(), woVat: z.number() }).array(),
  })
  schema.parse(res)

  return {
    count: res?.count || 0,
    total: {
      withVat: res.total[0].withVat,
      woVat: res.total[0].woVat,
    },
  }
}

export async function pickOrdersForPaymentInvoice({
  company,
  period,
  client,
  truck,
  driver,
  search,
  docStatuses,
  agreement,
  agreements,
  loadingZones,
  tks,
  numbers,
  limit,
  skip,
  sortBy,
  sortDesc,
}: IPickOrdersForPaymentInvoiceProps): Promise<
  [OrderPickedForInvoiceDTO[], IStaticticData]
> {
  const firstMatcherBuilder = (
    filtersExpressions: Array<BooleanExpression | ArrayExpressionOperator>
  ): PipelineStage.Match => ({
    $match: {
      company: new Types.ObjectId(company),
      isActive: true,
      $expr: {
        $and: [
          { $eq: ['$state.status', 'completed'] },
          {
            $and: [
              { $gte: [orderPlannedDateBuilder(), period.start] },
              { $lt: [orderPlannedDateBuilder(), period.end] },
            ],
          },

          ...filtersExpressions,
        ],
      },
    },
  })

  const filters: Array<BooleanExpression | ArrayExpressionOperator> = []
  if (search) {
    filters.push(orderSearchByNumberFragmentBuilder(search))
  }
  if (docStatuses?.length)
    filters.push({
      $or: docStatuses.map((docStatus) =>
        orderDocsStatusConditionBuilder(docStatus)
      ),
    })
  if (truck)
    filters.push({
      $eq: ['$confirmedCrew.truck', new Types.ObjectId(truck)],
    })

  if (driver)
    filters.push({
      $eq: ['$confirmedCrew.driver', new Types.ObjectId(driver)],
    })

  if (numbers && numbers.length > 0)
    filters.push({
      $in: ['$client.num', numbers],
    })

  if (tks?.length)
    filters.push({
      $in: ['$confirmedCrew.tkName', tks.map((i) => new Types.ObjectId(i))],
    })

  const clientFilters: Array<BooleanExpression | ArrayExpressionOperator> = []

  if (client)
    clientFilters.push({ $eq: ['$client.client', new Types.ObjectId(client)] })

  if (agreement)
    clientFilters.push({
      $eq: ['$client.agreement', new Types.ObjectId(agreement)],
    })

  if (agreements?.length)
    clientFilters.push({
      $in: ['$client.agreement', agreements.map((i) => new Types.ObjectId(i))],
    })

  const paymentInvoiceFilterBuilder = (
    orderIdField = '_id'
  ): PipelineStage[] => [
    {
      $lookup: {
        from: 'ordersInPaymentInvoices',
        localField: orderIdField,
        foreignField: 'order',
        as: 'paymentInvoices',
      },
    },
    { $match: { $expr: { $eq: [{ $size: '$paymentInvoices' }, 0] } } },
  ]

  const addAgreementBuilder = (
    localField = 'client.agreement'
  ): PipelineStage[] => [
    {
      $lookup: {
        from: 'agreements',
        localField: localField,
        foreignField: '_id',
        as: 'agreement',
      },
    },
    { $addFields: { agreement: { $first: '$agreement' } } },
  ]

  const addFields: PipelineStage[] = [
    {
      $addFields: {
        plannedDate: orderPlannedDateBuilder(),
        orderId: '$_id',
        isSelectable: true,
        agreementVatRate: '$agreement.vatRate',
        itemType: 'order',
        docNumbers: orderDocNumbersStringFragment({
          docsFieldName: '$docs',
          onlyForAddToRegistry: false,
        }),
        paymentPartsSumWOVat: {
          $reduce: {
            initialValue: 0,
            input: '$paymentParts',
            in: { $add: ['$$value', '$$this.priceWOVat'] },
          },
        },
      },
    },
    { $unset: ['paymentParts'] },
    {
      $addFields: {
        totalWOVatByTypes: finalPricesWOVatFragmentBuilder(),
      },
    },
    {
      $addFields: {
        _totalWOVat: {
          $subtract: [totalSumWOVatFragmentBuilder(), '$paymentPartsSumWOVat'],
        },
      },
    },
    {
      $addFields: {
        _total: {
          $add: [
            '$_totalWOVat',
            {
              $multiply: ['$_totalWOVat', '$agreement.vatRate', 0.01],
            },
          ],
        },
      },
    },
  ]

  const unionSecondMatcher = (
    agreement?: string,
    agreements?: string[],
    client?: string
  ): PipelineStage.Match => {
    const matcher: PipelineStage.Match = {
      $match: {
        $expr: {
          $and: [],
        },
      },
    }
    if (agreement)
      matcher.$match.$expr?.$and.push({
        $eq: ['$paymentParts.agreement', new Types.ObjectId(agreement)],
      })
    if (agreements?.length)
      matcher.$match.$expr?.$and.push({
        $in: [
          '$paymentParts.agreement',
          agreements.map((i) => new Types.ObjectId(i)),
        ],
      })
    if (client)
      matcher.$match.$expr?.$and.push({
        $eq: ['$paymentParts.client', new Types.ObjectId(client)],
      })
    return matcher
  }

  const unionWithPaymentPartsOrders: PipelineStage.UnionWith = {
    $unionWith: {
      coll: 'orders',
      pipeline: [
        firstMatcherBuilder([
          ...filters,
          { $isArray: '$paymentParts' },
          { $gte: [{ $size: '$paymentParts' }, 1] },
        ] as BooleanExpression[]) as PipelineStage.Match,

        { $unwind: { path: '$paymentParts' } },
        unionSecondMatcher(agreement, agreements, client),
        ...paymentInvoiceFilterBuilder('paymentParts._id'),
        ...addAgreementBuilder('paymentParts.agreement'),
        {
          $addFields: {
            orderId: '$_id',
            _id: '$paymentParts._id',
            plannedDate: orderPlannedDateBuilder(),
            isSelectable: true,
            agreementVatRate: '$agreement.vatRate',
            itemType: 'paymentPart',
            paymentPartsSumWOVat: 0,
          },
        },
        {
          $addFields: {
            _totalWOVat: '$paymentParts.priceWOVat',
            _total: {
              $add: [
                '$paymentParts.priceWOVat',
                {
                  $multiply: [
                    '$paymentParts.priceWOVat',
                    '$agreement.vatRate',
                    0.01,
                  ],
                },
              ],
            },
          },
        },

        { $limit: 50 },
      ] as any[],
    },
  }

  const sortingBuilder = (
    sortBy: string[] = [],
    sortDesc: boolean[] = []
  ): PipelineStage.Sort => {
    if (!Array.isArray(sortBy)) return { $sort: { plannedDate: 1 } }

    const fieldMapper = new Map<string, string>()
    fieldMapper.set('plannedDateStr', 'plannedDate')
    fieldMapper.set('totalPriceWOvat', '_totalWOVat')
    fieldMapper.set('totalPrice', '_total')
    const filteredArr = sortBy.filter((i) => fieldMapper.has(i))
    if (!filteredArr?.length) return { $sort: { plannedDate: 1 } }
    const fieldName = fieldMapper.get(filteredArr[0]) || 'plannedDate'

    return {
      $sort: {
        [fieldName]: sortDesc[0] ? -1 : 1,
      },
    }
  }

  const finalFacet: PipelineStage[] = [
    {
      $facet: {
        items: [
          { $skip: skip || 0 },
          { $limit: !!limit && limit > 0 ? limit : 50 },
        ],
        count: [{ $count: 'count' }],
        total: [
          {
            $group: {
              _id: null,
              withVat: { $sum: '$_total' },
              woVat: { $sum: '$_totalWOVat' },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        count: {
          $getField: {
            field: 'count',
            input: { $first: '$count' },
          },
        },
        total: {
          withVat: {
            $getField: {
              field: 'withVat',
              input: { $first: '$total' },
            },
          },
          woVat: {
            $getField: {
              field: 'woVat',
              input: { $first: '$total' },
            },
          },
        },
      },
    },
  ]

  const [res] = await OrderModel.aggregate([
    firstMatcherBuilder([...filters, ...clientFilters]),
    ...paymentInvoiceFilterBuilder('_id'),
    ...addAgreementBuilder('client.agreement'),
    ...addFields,
    unionWithPaymentPartsOrders,
    ...orderLoadingZoneFragmentBuilder(loadingZones),
    sortingBuilder(sortBy, sortDesc),
    ...finalFacet,
  ])

  const statisticData: IStaticticData = setStatisticData(res)
  return [
    res.items.map(
      (i: OrderPickedForInvoiceDTOProps) => new OrderPickedForInvoiceDTO(i)
    ),
    statisticData,
  ]
}
