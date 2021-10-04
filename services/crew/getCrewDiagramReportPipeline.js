import mongoose from 'mongoose'

export default ({ period, profile }) => {
  const periodArr = period.split(',')
  if (!periodArr || periodArr.length !== 2) throw new Error('bad query params')
  const startDate = new Date(periodArr[0])
  const endDate = new Date(periodArr[1])
  if (startDate > endDate) throw new Error('bad query params')

  const company = mongoose.Types.ObjectId(profile)

  const firstMatcher = {
    $match: {
      company: company,
      $or: [
        {
          $expr: {
            $and: [
              { $gte: ['$startDate', startDate] },
              { $lte: ['$startDate', endDate] }
            ]
          }
        },
        {
          $expr: {
            $and: [
              { $gte: ['$endDate', startDate] },
              { $lte: ['$endDate', endDate] }
            ]
          }
        },
        {
          $expr: {
            $and: [
              { $lte: ['$startDate', startDate] },
              { $gte: ['$endDate', endDate] }
            ]
          }
        },
        {
          $expr: {
            $and: [{ $lte: ['$startDate', startDate] }, { endDate: null }]
          }
        }
      ]
    }
  }
  const unwindTransport = {
    $unwind: '$transport'
  }
  const truckLookup = {
    $lookup: {
      from: 'trucks',
      localField: 'transport.truck',
      foreignField: '_id',
      as: 'truck'
    }
  }
  const driverLookup = {
    $lookup: {
      from: 'drivers',
      localField: 'driver',
      foreignField: '_id',
      as: 'driver'
    }
  }
  const trailerLookup = {
    $lookup: {
      from: 'trucks',
      localField: 'transport.trailer',
      foreignField: '_id',
      as: 'trailer'
    }
  }

  const finalProject = {
    $project: {
      _id: '$transport._id',
      crewId: '$_id',
      truck: { $first: '$truck' },
      driver: { $first: '$driver' },
      trailer: { $first: '$trailer' },
      startDate: '$transport.startDate',
      endDate: '$transport.endDate'
    }
  }

  return [
    firstMatcher,
    unwindTransport,
    truckLookup,
    driverLookup,
    trailerLookup,
    finalProject
  ]
}
