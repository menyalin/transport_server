import z from 'zod'
import {
  ArrayExpressionOperator,
  BooleanExpression,
  PipelineStage,
  Types,
} from 'mongoose'

import {
  finalPricesFragmentBuilder,
  recalcTotalByTypesFragmentBuilder,
} from './pipelineFragments/orderFinalPricesFragmentBuilder'
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

// Делитель для приведения цены с НДС к цене без НДС (1.20 для 20%)
const vatRateDivisor = () => ({
  $add: [1, { $multiply: ['$agreementVatRate', 0.01] }],
})

// Рассчитать сумму с НДС из суммы без НДС: totalWOVat * (1 + vatRate/100)
const _calcPriceWithVat = (priceWOVatField: string) => ({
  $multiply: [`$${priceWOVatField}`, vatRateDivisor()],
})

// Рассчитать сумму без НДС из суммы с НДС: total / (1 + vatRate/100)
const _calcPriceWOVat = (priceWithVatField: string) => ({
  $divide: [`$${priceWithVatField}`, vatRateDivisor()],
})

const calcTotal = () => ({
  $reduce: {
    input: { $objectToArray: '$totalByTypes' },
    initialValue: {
      price: 0,
      priceWOVat: 0,
    },
    in: {
      price: { $add: ['$$value.price', '$$this.v.price'] },
      priceWOVat: { $add: ['$$value.priceWOVat', '$$this.v.priceWOVat'] },
    },
  },
})

export async function pickOrdersForPaymentInvoice(
  p: IPickOrdersForPaymentInvoiceProps,
  vatRate: number,
  usePriceWithVat: boolean
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
        plannedDate: orderDateFragmentBuilder(),
        orderId: '$_id',
        isSelectable: true,
        agreementVatRate: vatRate,
        usePriceWithVat,
        itemType: 'order',
        docNumbers: orderDocNumbersStringFragment({
          docsFieldName: '$docs',
          onlyForAddToRegistry: false,
        }),
      },
    },
    {
      $addFields: {
        paymentPartsSum: {
          $reduce: {
            initialValue: 0,
            input: '$paymentParts',
            in: {
              $add: [
                '$$value',
                {
                  $cond: {
                    if: '$$ROOT.usePriceWithVat',
                    then: '$$this.price',
                    else: '$$this.priceWOVat',
                  },
                },
              ],
            },
          },
        },
      },
    },
    { $unset: ['paymentParts'] },
    {
      $addFields: {
        totalByTypes: finalPricesFragmentBuilder(usePriceWithVat),
      },
    },
    {
      $addFields: {
        totalByTypes: {
          $mergeObjects: [
            '$totalByTypes',
            {
              base: {
                $subtract: ['$totalByTypes.base', '$paymentPartsSum'],
              },
            },
          ],
        },
      },
    },
    {
      $addFields: {
        totalByTypes: recalcTotalByTypesFragmentBuilder(),
      },
    },
    {
      $addFields: {
        total: calcTotal(),
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
        unionSecondMatcher(p.agreement, p.agreements, p.client),
        ...paymentInvoiceFilterBuilder('paymentParts._id'),
        ...addAgreementBuilder('paymentParts.agreement'),
        {
          $addFields: {
            orderId: '$_id',
            _id: '$paymentParts._id',
            plannedDate: orderDateFragmentBuilder(),
            isSelectable: true,
            usePriceWithVat,
            agreementVatRate: vatRate,
            itemType: 'paymentPart',
            paymentPartsSum: 0,
            // Базовая цена для расчета: с НДС или без в зависимости от usePriceWithVat
            _basePrice: {
              $cond: {
                if: { $literal: usePriceWithVat },
                then: '$paymentParts.price',
                else: '$paymentParts.priceWOVat',
              },
            },
          },
        },
        {
          $addFields: {
            totalByTypes: {
              base: '$_basePrice',
            },
          },
        },
        {
          $addFields: {
            totalByTypes: recalcTotalByTypesFragmentBuilder(['base']),
          },
        },
        {
          $addFields: {
            total: calcTotal(),
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
          { $skip: p.skip || 0 },
          { $limit: p.limit && p.limit > 0 ? p.limit : 50 },
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
    ...orderLoadingZoneFragmentBuilder(p.loadingZones),
    sortingBuilder(p.sortBy, p.sortDesc),
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
