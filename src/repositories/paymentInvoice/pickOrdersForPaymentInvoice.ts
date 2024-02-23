import {
  ArrayExpressionOperator,
  BooleanExpression,
  PipelineStage,
  Types,
} from 'mongoose'
import { Order as OrderModel } from '../../models'
import { OrderPickedForInvoiceDTO } from '../../domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import { orderLoadingZoneFragmentBuilder } from '../../services/_pipelineFragments/orderLoadingZoneFragmentBuilder'
import { orderSearchByNumberFragmentBuilder } from '../../services/_pipelineFragments/orderSearchByNumberFragmentBuilder'
import { orderPlannedDateBuilder } from '../../services/_pipelineFragments/orderPlannedDateBuilder'
import {
  IPickOrdersForPaymentInvoiceProps,
  IStaticticData,
  OrderPickedForInvoiceDTOProps,
} from '../../domain/paymentInvoice/interfaces'

export async function pickOrdersForPaymentInvoice({
  company,
  period,
  client,
  truck,
  driver,
  search,
  agreement,
  agreements,
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
  ): PipelineStage.Match =>
    ({
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
    }) as PipelineStage.Match

  const filters: Array<BooleanExpression | ArrayExpressionOperator> = []
  if (search) {
    filters.push(orderSearchByNumberFragmentBuilder(search))
  }

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
      matcher.$match.$expr.$and.push({
        $eq: ['$paymentParts.agreement', new Types.ObjectId(agreement)],
      })
    if (agreements?.length)
      matcher.$match.$expr.$and.push({
        $in: [
          '$paymentParts.agreement',
          agreements.map((i) => new Types.ObjectId(i)),
        ],
      })
    if (client)
      matcher.$match.$expr.$and.push({
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

        { $limit: 50 },
      ] as any[],
    },
  }

  const loadingZoneFragment = orderLoadingZoneFragmentBuilder()

  const sortingBuilder = (
    sortBy: string[] = [],
    sortDesc: boolean[] = []
  ): PipelineStage.Sort => {
    if (!Array.isArray(sortBy)) return { $sort: { plannedDate: 1 } }

    const fieldMapper = new Map<string, string>()
    fieldMapper.set('plannedDateStr', 'plannedDate')

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
      },
    },
  ]

  const [res] = await OrderModel.aggregate([
    firstMatcherBuilder([...filters, ...clientFilters]),
    ...paymentInvoiceFilterBuilder('_id'),
    ...addAgreementBuilder('client.agreement'),
    ...addFields,
    unionWithPaymentPartsOrders,
    ...loadingZoneFragment,
    sortingBuilder(sortBy, sortDesc),
    ...finalFacet,
  ])

  return [
    res.items.map(
      (i: OrderPickedForInvoiceDTOProps) => new OrderPickedForInvoiceDTO(i)
    ),
    { count: res.count },
  ]
}
