import mongoose from 'mongoose'

export default ({ company, date, limit, skip }) => {
  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company)
    }
  }

  const group = [
    {
      $group: {
        _id: 'agreements',
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
