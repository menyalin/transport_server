import mongoose from 'mongoose'

export const getListPipeline = ({
  company,
  startDate,
  endDate,
  truckFilter,
  limit,
  skip,
  sortBy,
  sortDesc,
}) => {
  const sP = new Date(startDate)
  const eP = new Date(endDate)

  let sortingField = 'startPositionDate'
  let sortingDirection = -1
  switch (sortBy) {
    case 'startPositionDate':
      sortingField = 'startPositionDate'
      sortingDirection = sortDesc === 'true' ? -1 : 1
      break
    case 'truck':
      sortingField = 'truck'
      sortingDirection = sortDesc === 'true' ? -1 : 1
      break
  }

  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      $and: [
        { startPositionDate: { $gte: sP } },
        { startPositionDate: { $lt: eP } },
      ],
    },
  }
  if (truckFilter)
    firstMatcher.$match.truck = mongoose.Types.ObjectId(truckFilter)
  const group = [
    {
      $sort: {
        [sortingField]: sortingDirection,
      },
    },
    {
      $group: {
        _id: 'downtimes',
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
