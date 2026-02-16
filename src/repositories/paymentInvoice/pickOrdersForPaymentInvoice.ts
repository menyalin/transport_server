import z from 'zod'
import {
  ArrayExpressionOperator,
  BooleanExpression,
  PipelineStage,
  Types,
} from 'mongoose'

import {
  IStaticticData,
  IPickOrdersForPaymentInvoiceProps,
  OrderPickedForInvoiceDTOProps,
} from '@/domain/paymentInvoice/interfaces'
import { OrderModel } from '@/models/order'
import { orderLoadingZoneFragmentBuilder } from '@/shared/pipelineFragments/orderLoadingZoneFragmentBuilder'
import { orderSearchByNumberFragmentBuilder } from '@/shared/pipelineFragments/orderSearchByNumberFragmentBuilder'
import { orderDocNumbersStringFragment } from '@/shared/pipelineFragments/orderDocNumbersStringBuilder'
import { orderDocsStatusConditionBuilder } from '@/shared/pipelineFragments/orderDocsStatusConditionBuilder'
import { orderDateFragmentBuilder } from '@/shared/pipelineFragments/orderDateFragmentBuilder'
import { OrderPickedForInvoiceDTO } from '@/domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import { totalByTypesFragementBuilder } from './pipelines/pipelineFragments/totalByTypesFragementBuilder'
import { agreementLookupBuilder } from '@/shared/pipelineFragments/agreementLookupBuilder'

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

export async function pickOrdersForPaymentInvoice(
  p: IPickOrdersForPaymentInvoiceProps,
  vatRate?: number,
  usePriceWithVat?: boolean
): Promise<[unknown[], IStaticticData?]> {
  const firstMatcherBuilder = (
    filtersExpressions: Array<BooleanExpression | ArrayExpressionOperator>
  ): PipelineStage.Match => ({
    $match: {
      company: new Types.ObjectId(p.company),
      isActive: true,
      $expr: {
        $and: [
          { $eq: ['$state.status', 'completed'] },
          {
            $and: [
              { $gte: [orderDateFragmentBuilder(), p.period.start] },
              { $lt: [orderDateFragmentBuilder(), p.period.end] },
            ],
          },

          ...filtersExpressions,
        ],
      },
    },
  })

  const filters: Array<BooleanExpression | ArrayExpressionOperator> = []

  if (p.search) {
    filters.push(orderSearchByNumberFragmentBuilder(p.search))
  }

  if (p.docStatuses?.length)
    filters.push({
      $or: p.docStatuses.map((docStatus) =>
        orderDocsStatusConditionBuilder(docStatus)
      ),
    })
  if (p.truck)
    filters.push({
      $eq: ['$confirmedCrew.truck', new Types.ObjectId(p.truck)],
    })
  if (p.carriers?.length)
    filters.push({
      $in: [
        '$confirmedCrew.tkName',
        p.carriers.map((i) => new Types.ObjectId(i)),
      ],
    })

  if (p.numbers && p.numbers.length > 0)
    filters.push({
      $in: ['$client.num', p.numbers],
    })

  const clientFilters: Array<BooleanExpression | ArrayExpressionOperator> = []

  if (p.client)
    clientFilters.push({
      $eq: ['$client.client', new Types.ObjectId(p.client)],
    })

  if (p.agreement)
    clientFilters.push({
      $eq: ['$client.agreement', new Types.ObjectId(p.agreement)],
    })

  if (p.agreements?.length)
    clientFilters.push({
      $in: [
        '$client.agreement',
        p.agreements.map((i) => new Types.ObjectId(i)),
      ],
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

  const addFields: PipelineStage[] = [
    ...agreementLookupBuilder(),
    {
      $addFields: {
        plannedDate: orderDateFragmentBuilder(),
        orderId: '$_id',
        isSelectable: true,
        agreementVatRate: { $ifNull: [vatRate, '$client.vatRateInfo.vatRate'] },
        usePriceWithVat: {
          $ifNull: [usePriceWithVat, '$client.vatRateInfo.usePriceWithVat'],
        },
        itemType: 'order',
        docNumbers: orderDocNumbersStringFragment({
          docsFieldName: '$docs',
          onlyForAddToRegistry: false,
        }),
      },
    },

    ...totalByTypesFragementBuilder(false),
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
        unionSecondMatcher(p.agreement, p.agreements, p.client),
        ...paymentInvoiceFilterBuilder('paymentParts._id'),
        ...agreementLookupBuilder('paymentParts.agreement'),
        {
          $addFields: {
            orderId: '$_id',
            _id: '$paymentParts._id',
            plannedDate: orderDateFragmentBuilder(),
            isSelectable: true,
            agreementVatRate: {
              $ifNull: [vatRate, '$client.vatRateInfo.vatRate'],
            },
            usePriceWithVat: {
              $ifNull: [usePriceWithVat, '$client.vatRateInfo.usePriceWithVat'],
            },
            itemType: 'paymentPart',
            paymentPartsSum: 0,
          },
        },
        ...totalByTypesFragementBuilder(true),
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
          { $skip: p.skip || 0 },
          { $limit: p.limit && p.limit > 0 ? p.limit : 50 },
        ],
        count: [{ $count: 'count' }],
        total: [
          {
            $group: {
              _id: null,
              withVat: { $sum: '$total.price' },
              woVat: { $sum: '$total.priceWOVat' },
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
    ...addFields,
    unionWithPaymentPartsOrders,
    ...orderLoadingZoneFragmentBuilder(p.loadingZones),
    sortingBuilder(p.sortBy, p.sortDesc),
    ...finalFacet,
  ])

  const statisticData: IStaticticData = setStatisticData(res)
  return [
    // res.items,
    res.items.map(
      (i: OrderPickedForInvoiceDTOProps) => new OrderPickedForInvoiceDTO(i)
    ),
    statisticData,
  ]
}
