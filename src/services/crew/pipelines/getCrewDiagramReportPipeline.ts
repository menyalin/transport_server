// @ts-nocheck
import mongoose from 'mongoose'

export default ({ period, profile }) => {
  const periodArr = period.split(',')
  if (!periodArr || periodArr.length !== 2) throw new Error('bad query params')
  const startPeriod = new Date(periodArr[0])
  const endPeriod = new Date(periodArr[1])
  if (startPeriod > endPeriod) throw new Error('bad query params')

  const company = new mongoose.Types.ObjectId(profile)

  const firstMatcher = {
    $match: {
      company: company,
      transport: {
        $elemMatch: {
          $or: [
            {
              $and: [{ startDate: { $lte: endPeriod } }, { endDate: null }]
            },
            {
              $and: [
                { startDate: { $lte: startPeriod } },
                { endDate: { $gte: startPeriod } }
              ]
            },
            {
              $and: [
                { startDate: { $gte: startPeriod } },
                { startDate: { $lt: endPeriod } }
              ]
            }
          ]
        }
      }
    }
  }

  const unwindTransport = {
    $unwind: '$transport'
  }

  const secondMatcher = {
    $match: {
      $or: [
        {
          $and: [
            { 'transport.startDate': { $lte: endPeriod } },
            { 'transport.endDate': null }
          ]
        },
        {
          $and: [
            { 'transport.startDate': { $lte: startPeriod } },
            { 'transport.endDate': { $gte: startPeriod } }
          ]
        },
        {
          $and: [
            { 'transport.startDate': { $gte: startPeriod } },
            { 'transport.startDate': { $lt: endPeriod } }
          ]
        }
      ]
    }
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
      tkNameId: '$tkName',
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
    secondMatcher,
    truckLookup,
    driverLookup,
    trailerLookup,
    finalProject
  ]
}
