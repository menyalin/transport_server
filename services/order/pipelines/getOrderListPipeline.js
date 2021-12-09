import mongoose from 'mongoose'

export const getOrderListPipeline = ({
  profile,
  startDate,
  endDate,
  limit,
  skip
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
          { $lte: [firstPlannedDate, eP] }
        ]
      }
    }
  }
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
  return [firstMatcher, ...group]
}
