// @ts-nocheck
import mongoose from 'mongoose'

export default ({ company, date, limit, skip, client }) => {
  const firstMatcher = {
    $match: {
      isActive: true,
      company: new mongoose.Types.ObjectId(company),
      $expr: {
        $and: [],
      },
    },
  }

  if (client)
    firstMatcher.$match.$expr.$and.push({
      $in: [new mongoose.Types.ObjectId(client), '$clients'],
    })

  const group = [
    {
      $group: {
        _id: 'agreements',
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
