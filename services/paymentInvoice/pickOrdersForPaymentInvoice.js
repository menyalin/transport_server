import mongoose from 'mongoose'
import { BadRequestError } from '../../helpers/errors.js'
import { Order as OrderModel } from '../../models/index.js'
import {
  finalPricesFragmentBuilder,
  totalSumFragmentBuilder,
} from '../_pipelineFragments/orderFinalPricesFragmentBuilder.js'
import { orderLoadingZoneFragmentBuilder } from '../_pipelineFragments/orderLoadingZoneFragmentBuilder.js'
import { orderSearchByNumberFragmentBuilder } from '../_pipelineFragments/orderSearchByNumberFragmentBuilder.js'
import { orderPlannedDateBuilder } from '../_pipelineFragments/orderPlannedDateBuilder.js'

const paymentPartsSumWOVatFragemt = {
  $reduce: {
    initialValue: 0,
    input: '$paymentParts',
    in: { $add: ['$$value', '$$this.priceWOVat'] },
  },
}

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
}) {
  if (!company || !client || !period)
    throw new BadRequestError(
      'getOrdersForPaymentInvoice. required args is missing!!'
    )

  const firstMatcherBuilder = (filtersExpressions = []) => ({
    $match: {
      company: mongoose.Types.ObjectId(company),
      isActive: true,
      $expr: {
        $and: [
          { $eq: ['$state.status', 'completed'] },
          {
            $and: [
              { $gte: [orderPlannedDateBuilder(), new Date(period[0])] },
              { $lt: [orderPlannedDateBuilder(), new Date(period[1])] },
            ],
          },
          ...filtersExpressions,
        ],
      },
    },
  })

  const filters = []
  if (search) {
    filters.push(orderSearchByNumberFragmentBuilder(search))
  }

  if (truck)
    filters.push({
      $eq: ['$confirmedCrew.truck', mongoose.Types.ObjectId(truck)],
    })

  if (driver)
    filters.push({
      $eq: ['$confirmedCrew.driver', mongoose.Types.ObjectId(driver)],
    })

  const paymentInvoiceFilterBuilder = (orderIdField = '_id') => [
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

  const addAgreementBuilder = (localField = 'client.agreement') => [
    {
      $lookup: {
        from: 'agreements',
        localField: localField,
        foreignField: '_id',
        as: '_agreement',
      },
    },
    { $addFields: { _agreement: { $first: '$_agreement' } } },
  ]

  const addFields = [
    {
      $addFields: {
        plannedDate: orderPlannedDateBuilder(),
        orderId: '$_id',
        isSelectable: true,
        agreementVatRate: '$_agreement.vatRate',
        paymentPartsSumWOVat: paymentPartsSumWOVatFragemt,
        totalByTypes: { ...finalPricesFragmentBuilder() },
      },
    },
    {
      $addFields: {
        'totalByTypes.base': {
          $subtract: [
            '$totalByTypes.base',
            { $ifNull: ['$paymentPartsSumWOVat', 0] },
          ],
        },
      },
    },
    {
      $addFields: {
        total: totalSumFragmentBuilder(),
      },
    },
  ]

  const unionWithPaymentPartsOrders = [
    {
      $unionWith: {
        coll: 'orders',
        pipeline: [
          firstMatcherBuilder([
            ...filters,
            {
              $in: [
                mongoose.Types.ObjectId(client),
                {
                  $ifNull: [
                    { $map: { input: '$paymentParts', in: '$$this.client' } },
                    [],
                  ],
                },
              ],
            },
          ]),
          { $unwind: { path: '$paymentParts' } },
          {
            $match: { 'paymentParts.client': mongoose.Types.ObjectId(client) },
          },
          ...paymentInvoiceFilterBuilder('paymentParts._id'),
          ...addAgreementBuilder('paymentParts.agreement'),
          {
            $addFields: {
              orderId: '$_id',
              _id: '$paymentParts._id',
              plannedDate: orderPlannedDateBuilder(),
              isSelectable: true,
              agreementVatRate: '$_agreement.vatRate',
              totalByTypes: {
                base: '$paymentParts.priceWOVat',
              },
            },
          },
          {
            $addFields: {
              total: totalSumFragmentBuilder(),
            },
          },
          { $limit: 20 },
        ],
      },
    },
  ]

  const loadingZoneFragment = orderLoadingZoneFragmentBuilder()
  const orders = await OrderModel.aggregate([
    firstMatcherBuilder([
      { $eq: ['$client.client', mongoose.Types.ObjectId(client)] },
      ...filters,
    ]),
    ...paymentInvoiceFilterBuilder('_id'),
    ...addAgreementBuilder('client.agreement'),
    ...addFields,
    ...unionWithPaymentPartsOrders,
    ...loadingZoneFragment,
    { $limit: 10 },
  ])

  return [...orders]
}
