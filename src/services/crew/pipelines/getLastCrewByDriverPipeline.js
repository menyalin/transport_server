import mongoose from 'mongoose'

export default (driver) => {
  if (!driver) throw new Error('bad pipeline arguments')

  const firstMatcher = {
    $match: {
      isActive: true,
      driver: mongoose.Types.ObjectId(driver)
    }
  }

  const sortByDate = {
    $sort: {
      startDate: -1
    }
  }

  const addTransportObj = {
    $addFields: {
      transport: {
        $last: '$transport'
      }
    }
  }

  return [firstMatcher, sortByDate, { $limit: 1 }, addTransportObj]
}
