import mongoose from 'mongoose'

export const getListPipeline = ({
  startDate,
  endDate,
  company,
  limit,
  skip,
}) => {
  const sP = new Date(startDate)
  const eP = new Date(endDate)

  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      $and: [{ date: { $gte: sP } }, { date: { $lt: eP } }],
    },
  }

  const group = [
    {
      $group: {
        _id: 'fines',
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
  return [firstMatcher, ...group]
}
