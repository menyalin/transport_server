import mongoose from 'mongoose'
import { BadRequestError } from '../../helpers/errors.js'
import { Order as OrderModel } from '../../models/index.js'
import {
  finalPricesFragmentBuilder,
  totalSumFragmentBuilder,
} from '../_pipelineFragments/orderFinalPricesFragmentBuilder.js'
import { orderLoadingZoneFragmentBuilder } from '../_pipelineFragments/orderLoadingZoneFragmentBuilder.js'

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
  const orderPlannedDateFragment = {
    $getField: {
      field: 'plannedDate',
      input: { $first: '$route' },
    },
  }

  const firstMatcher = {
    $match: {
      company: mongoose.Types.ObjectId(company),
      isActive: true,
      $expr: {
        $and: [
          { $eq: ['$state.status', 'completed'] },
          { $eq: ['$client.client', mongoose.Types.ObjectId(client)] },
        ],
      },
    },
  }

  const paymentInvoiceFilter = [
    {
      $lookup: {
        from: 'ordersInPaymentInvoices',
        localField: '_id',
        foreignField: 'order',
        as: 'paymentInvoices',
      },
    },
    { $match: { $expr: { $eq: [{ $size: '$paymentInvoices' }, 0] } } },
  ]

  if (period.length === 2) {
    firstMatcher.$match.$expr.$and.push({
      $and: [
        { $gte: [orderPlannedDateFragment, new Date(period[0])] },
        { $lt: [orderPlannedDateFragment, new Date(period[1])] },
      ],
    })
  }
  const addFields = [
    {
      $addFields: {
        plannedDate: orderPlannedDateFragment,
        totalByTypes: { ...finalPricesFragmentBuilder() },
      },
    },
    {
      $addFields: {
        total: { ...totalSumFragmentBuilder() },
      },
    },
  ]

  const loadingZoneFragment = orderLoadingZoneFragmentBuilder()
  const orders = await OrderModel.aggregate([
    firstMatcher,
    ...paymentInvoiceFilter,
    ...loadingZoneFragment,
    ...addFields,
    { $limit: 10 },
  ])

  return [...orders]
}
