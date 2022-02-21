import mongoose from 'mongoose'

export const getOrderListPipeline = ({
  profile,
  client,
  startDate,
  endDate,
  limit,
  skip,
  status,
  truck,
  accountingMode,
  driver
}) => {
  const sP = new Date(startDate)
  const eP = new Date(endDate)

  const firstPlannedDate = {
    $getField: {
      field: 'plannedDate',
      input: { $arrayElemAt: ['$route', 0] }
    }
  }

  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(profile),
      $expr: {
        $and: [
          { $gte: [firstPlannedDate, sP] },
          { $lt: [firstPlannedDate, eP] }
        ]
      }
    }
  }
  if (status) firstMatcher.$match['state.status'] = status
  if (client)
    firstMatcher.$match['client.client'] = mongoose.Types.ObjectId(client)

  if (truck)
    firstMatcher.$match['confirmedCrew.truck'] = mongoose.Types.ObjectId(truck)
  const agreementLookup = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'client.agreement',
        foreignField: '_id',
        as: 'agreements'
      }
    },
    {
      $addFields: {
        agreement: {
          $first: '$agreements'
        }
      }
    }
  ]

  if (driver)
    firstMatcher.$match['confirmedCrew.driver'] = mongoose.Types.ObjectId(
      driver
    )
  const group = [
    {
      $sort: {
        createdAt: -1.0
      }
    },
    {
      $group: {
        _id: 'orders',
        items: {
          $push: '$$ROOT'
        }
      }
    },
    {
      $addFields: {
        count: {
          $size: '$items'
        },
        items: {
          $slice: ['$items', +skip, +limit]
        }
      }
    }
  ]
  let pipeline = [firstMatcher]
  if (accountingMode) pipeline = [...pipeline, ...agreementLookup]
  return [...pipeline, ...group]
}
