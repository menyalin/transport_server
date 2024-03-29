// @ts-nocheck
import { BadRequestError } from '../../../helpers/errors'
import mongoose from 'mongoose'

export default ({ company, date, truckType, tkName }) => {
  const inputDate = new Date(date)
  if (!inputDate) throw new BadRequestError('Ошибка в формате даты')

  const firstMatcher = {
    $match: {
      company: new mongoose.Types.ObjectId(company),
      type: truckType,
      isActive: true,
      $or: [{ endServiceDate: null }, { endServiceDate: { $gt: inputDate } }],
    },
  }
  if (tkName) firstMatcher.$match.tkName = new mongoose.Types.ObjectId(tkName)

  return [
    firstMatcher,
    {
      $lookup: {
        from: 'crews',
        let: { truckId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$company', new mongoose.Types.ObjectId(company)] },
                  { $eq: ['$isActive', true] },
                  { $lte: ['$startDate', inputDate] },
                  {
                    $or: [
                      { $eq: ['$endDate', null] },
                      { $gt: ['$endDate', inputDate] },
                    ],
                  },
                ],
              },
            },
          },
          {
            $unwind: '$transport',
          },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$transport.' + truckType, '$$truckId'] },
                  { $lte: ['$transport.startDate', inputDate] },
                  {
                    $or: [
                      { $eq: ['$transport.endDate', null] },
                      { $gt: ['$transport.endDate', inputDate] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'crew',
      },
    },
    {
      $addFields: {
        crew: {
          $first: '$crew',
        },
      },
    },
    {
      $lookup: {
        from: 'downtimes',
        let: { truckId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$truck', '$$truckId'] },
                  { $eq: ['$isActive', true] },

                  { $lte: ['$startPositionDate', inputDate] },
                  { $gt: ['$endPositionDate', inputDate] },
                ],
              },
            },
          },
        ],
        as: 'downtime',
      },
    },
    {
      $addFields: {
        downtime: { $first: '$downtime' },
      },
    },
    {
      $sort: { order: 1 },
    },
  ]
}
