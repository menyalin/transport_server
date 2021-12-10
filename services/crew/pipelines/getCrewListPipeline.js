import mongoose from 'mongoose'

export default ({ profile, limit, tkName, state, skip, sortBy, sortDesc }) => {
  let sortingField = 'startDate'
  let sortingDirection = -1
  switch (sortBy) {
    case 'tkName':
      sortingField = 'tkName'
      sortingDirection = sortDesc === 'true' ? -1 : 1
      break
    case 'driver':
      sortingField = 'driver'
      sortingDirection = sortDesc === 'true' ? -1 : 1
      break
    case 'startDate':
      sortingField = 'startDate'
      sortingDirection = sortDesc === 'true' ? -1 : 1
      break
  }

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
        [sortingField]: sortingDirection
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
