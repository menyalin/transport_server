import mongoose from 'mongoose'
import { getDocFragmentBuilder } from './fragments/docStatusFragment.js'

export const getOrderListPipeline = ({
  profile,
  client,
  startDate,
  endDate,
  limit,
  skip,
  docStatus,
  status,
  truck,
  accountingMode,
  driver,
  tkName,
  trailer,
  address,
}) => {
  const sP = new Date(startDate)
  const eP = new Date(endDate)

  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(profile),
      $expr: {
        $and: [
          { $gte: ['$startPositionDate', sP] },
          { $lt: ['$startPositionDate', eP] },
        ],
      },
    },
  }

  if (accountingMode)
    firstMatcher.$match.$expr.$and.push({
      $or: [
        { $eq: ['$state.status', 'inProgress'] },
        { $eq: ['$state.status', 'completed'] },
      ],
    })

  if (status && !accountingMode) firstMatcher.$match['state.status'] = status
  if (client)
    firstMatcher.$match['client.client'] = mongoose.Types.ObjectId(client)

  if (truck)
    firstMatcher.$match['confirmedCrew.truck'] = mongoose.Types.ObjectId(truck)
  if (trailer)
    firstMatcher.$match['confirmedCrew.trailer'] = mongoose.Types.ObjectId(
      // eslint-disable-next-line comma-dangle
      trailer
    )
  if (address)
    firstMatcher.$match['route.address'] = mongoose.Types.ObjectId(address)
  const agreementLookup = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'client.agreement',
        foreignField: '_id',
        as: 'agreements',
      },
    },
    {
      $addFields: {
        agreement: {
          $first: '$agreements',
        },
      },
    },
  ]
  const tkNameLookup = [
    {
      $lookup: {
        from: 'trucks',
        localField: 'confirmedCrew.truck',
        foreignField: '_id',
        as: 'trucks',
      },
    },
    {
      $addFields: {
        truck: {
          $first: '$trucks',
        },
      },
    },
    {
      $match: {
        'truck.tkName': mongoose.Types.ObjectId(tkName),
      },
    },
  ]

  if (driver)
    firstMatcher.$match['confirmedCrew.driver'] = mongoose.Types.ObjectId(
      // eslint-disable-next-line comma-dangle
      driver
    )
  if (docStatus)
    firstMatcher.$match.$expr.$and.push(getDocFragmentBuilder(docStatus))

  const group = [
    {
      $sort: {
        createdAt: -1.0,
      },
    },
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
        count: {
          $size: '$items',
        },
        items: {
          $slice: ['$items', +skip, +limit],
        },
      },
    },
  ]
  let pipeline = [firstMatcher]
  if (accountingMode) pipeline = [...pipeline, ...agreementLookup]
  if (tkName) pipeline = [...pipeline, ...tkNameLookup]
  return [...pipeline, ...group]
}
