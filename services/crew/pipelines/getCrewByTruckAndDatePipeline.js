import mongoose from 'mongoose'

export default ({ truck, date, state }) => {
  if (!truck || !date) throw new Error('bad pipeline arguments')
  const inputDate = new Date(date)
  const firstMatcher = {
    $match: {
      transport: {
        $elemMatch: {
          truck: mongoose.Types.ObjectId(truck),
          startDate: { $lte: inputDate },
          $or: [{ endDate: { $gt: inputDate } }, { endDate: null }]
        }
      }
    }
  }

  const secondMatcher = {
    $match: {
      'transport.truck': mongoose.Types.ObjectId(truck),
      'transport.startDate': { $lte: inputDate }
    }
  }
  return [
    firstMatcher,
    {
      $unwind: {
        path: '$transport'
      }
    },
    secondMatcher,
    {
      $sort: {
        'transport.startDate': -1
      }
    },
    {
      $limit: 1
    }
  ]
}
