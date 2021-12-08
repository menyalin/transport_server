import mongoose from 'mongoose'

export default ({ profile, limit, tkName, state, skip }) => {
  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(profile)
    }
  }
  if (tkName) firstMatcher.$match.tkName = mongoose.Types.ObjectId(tkName)
  if (state === 'active') firstMatcher.$match['transport.endDate'] = null
  if (state === 'inactive')
    firstMatcher.$match['transport.endDate'] = { $ne: null }
  const group = [
    {
      $sort: {
        startDate: -1.0
      }
    },
    {
      $group: {
        _id: 'crews',
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
