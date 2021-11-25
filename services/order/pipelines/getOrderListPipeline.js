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
      company: mongoose.Types.ObjectId(profile),
      $expr: {
        $and: [
          { $gte: [firstPlannedDate, sP] },
          { $lte: [firstPlannedDate, eP] }
        ]
      }
    }
  }
  return [firstMatcher, { $skip: +skip }, { $limit: +limit }]
}
