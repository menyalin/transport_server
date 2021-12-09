import mongoose from 'mongoose'

export const getListPipeline = ({
  company,
  startDate,
  endDate,
  limit,
  skip
}) => {
  const sP = new Date(startDate)
  const eP = new Date(endDate)

  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      $and: [
        { startPositionDate: { $gte: sP } },
        { startPositionDate: { $lt: eP } }
      ]
    }
  }
  const group = [
    {
      $sort: {
        startPositionDate: -1.0
      }
    },
    {
      $group: {
        _id: 'downtimes',
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
