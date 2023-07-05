// @ts-nocheck
import mongoose from 'mongoose'

export default ({ company, date, limit, skip, type, tk, liftCapacity }) => {
  const groupByDate = []
  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      $expr: {
        $and: [],
      },
    },
  }
  if (type) firstMatcher.$match.type = type
  if (tk)
    firstMatcher.$match.$expr.$and.push({
      $in: [mongoose.Types.ObjectId(tk), '$tks'],
    })

  if (liftCapacity)
    firstMatcher.$match.$expr.$and.push({
      $in: [+liftCapacity, '$liftCapacity'],
    })

  if (date) {
    firstMatcher.$match.date = { $lte: new Date(date) }
    groupByDate.push({
      $sort: { date: 1, createdAt: 1 },
    })

    groupByDate.push({
      $group: {
        _id: {
          type: '$type',
          liftCapacity: '$liftCapacity',
          loading: '$loading',
          unloading: '$unloading',
          loadingZone: '$loadingZone',
          unloadingZone: '$unloadingZone',
        },
        tariff: { $last: '$$ROOT' },
      },
    })

    groupByDate.push({
      $replaceRoot: {
        newRoot: '$tariff',
      },
    })
  }

  const group = [
    {
      $group: {
        _id: 'tariffs',
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
  const pipeline = [firstMatcher]
  if (date) pipeline.push(...groupByDate)
  return [...pipeline, ...group]
}
