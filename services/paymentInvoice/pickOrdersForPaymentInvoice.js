import mongoose from 'mongoose'
import { BadRequestError } from '../../helpers/errors.js'
import { Order as OrderModel } from '../../models/index.js'
import {
  finalPricesFragmentBuilder,
  totalSumFragmentBuilder,
} from '../_pipelineFragments/orderFinalPricesFragmentBuilder.js'
import { orderLoadingZoneFragmentBuilder } from '../_pipelineFragments/orderLoadingZoneFragmentBuilder.js'
import { orderSearchByNumberFragmentBuilder } from '../_pipelineFragments/orderSearchByNumberFragmentBuilder.js'

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
  if (search) {
    firstMatcher.$match.$expr.$and.push(
      orderSearchByNumberFragmentBuilder(search)
    )
  }

  if (truck)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.truck', mongoose.Types.ObjectId(truck)],
    })

  if (driver)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.driver', mongoose.Types.ObjectId(driver)],
    })

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
        isSelectable: true,
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
    { $limit: 30 },
  ])

  return [...orders]
}
