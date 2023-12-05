import { BooleanExpression, PipelineStage, Types } from 'mongoose'
import { BadRequestError } from '../../helpers/errors'
import { Order as OrderModel } from '../../models'
import { OrderPickedForInvoiceDTO } from '../../domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import {
  finalPricesFragmentBuilder,
  totalSumFragmentBuilder,
} from '../../services/_pipelineFragments/orderFinalPricesFragmentBuilder'
import { orderLoadingZoneFragmentBuilder } from '../../services/_pipelineFragments/orderLoadingZoneFragmentBuilder'
import { orderSearchByNumberFragmentBuilder } from '../../services/_pipelineFragments/orderSearchByNumberFragmentBuilder'
import { orderPlannedDateBuilder } from '../../services/_pipelineFragments/orderPlannedDateBuilder'
import { IPickOrdersForPaymentInvoiceProps } from '../../domain/paymentInvoice/interfaces'
import { paymentPartsSumFragment } from './pipelineFragments/paymentPartsSumFragment'
import { substructPaymentPartsFromBase } from './pipelineFragments/substructPaymentPartsFromBase'

export async function pickOrdersForPaymentInvoice({
  company,
  client,
  period,
  paymentInvoiceId,
  docStatus,
  onlySelectable,
  truck,
  driver,
  loadingZone,
  search,
}: IPickOrdersForPaymentInvoiceProps): Promise<OrderPickedForInvoiceDTO[]> {
  if (!company || !client || !period)
    throw new BadRequestError(
      'getOrdersForPaymentInvoice. required args is missing!!'
    )

  const firstMatcherBuilder = (
    filtersExpressions: BooleanExpression[]
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

  const filters: BooleanExpression[] = []
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
        paymentPartsSumWOVat: paymentPartsSumFragment(false),
        paymentPartsSumWithVat: paymentPartsSumFragment(true),
        totalByTypes: { ...finalPricesFragmentBuilder() },
      },
    },
    substructPaymentPartsFromBase(),
    {
      $addFields: {
        total: totalSumFragmentBuilder(),
      },
    },
  ]

  const unionWithPaymentPartsOrders: PipelineStage.UnionWith = {
    $unionWith: {
      coll: 'orders',
      pipeline: [
        firstMatcherBuilder([
          ...filters,
          {
            $in: [
              new Types.ObjectId(client),
              {
                $ifNull: [
                  { $map: { input: '$paymentParts', in: '$$this.client' } },
                  [],
                ],
              },
            ],
          },
        ] as BooleanExpression[]) as PipelineStage.Match,
        { $unwind: { path: '$paymentParts' } },
        {
          $match: {
            'paymentParts.client': new Types.ObjectId(client),
          },
        },
        ...paymentInvoiceFilterBuilder('paymentParts._id'),
        ...addAgreementBuilder('paymentParts.agreement'),
        {
          $addFields: {
            orderId: '$_id',
            _id: '$paymentParts._id',
            plannedDate: orderPlannedDateBuilder(),
            isSelectable: true,
            agreementVatRate: '$agreement.vatRate',
            paymentPartsSumWOVat: 0,
            paymentPartsSumWithVat: 0,
            totalByTypes: {
              base: {
                price: '$paymentParts.price',
                priceWOVat: '$paymentParts.priceWOVat',
              },
            },
          },
        },
        {
          $addFields: {
            total: totalSumFragmentBuilder(),
          },
        },
        { $limit: 20 },
      ] as any[],
    },
  }

  const loadingZoneFragment = orderLoadingZoneFragmentBuilder()
  const orders = await OrderModel.aggregate([
    firstMatcherBuilder([
      ...filters,
      { $eq: ['$client.client', new Types.ObjectId(client)] },
    ]),
    ...paymentInvoiceFilterBuilder('_id'),
    ...addAgreementBuilder('client.agreement'),
    ...addFields,
    unionWithPaymentPartsOrders,
    ...loadingZoneFragment,
    { $limit: 40 },
  ])

  return orders.map((i) => new OrderPickedForInvoiceDTO(i))
}
