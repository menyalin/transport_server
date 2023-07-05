// @ts-nocheck
import mongoose from 'mongoose'

export default (truck) => {
  if (!truck) throw new Error('bad pipeline arguments')

  return [
    {
      $match: {
        isActive: true,
        $or: [
          { 'transport.truck': mongoose.Types.ObjectId(truck) },
          { 'transport.trailer': mongoose.Types.ObjectId(truck) }
        ]
      }
    },
    {
      $unwind: { path: '$transport' }
    },
    {
      $match: {
        $expr: {
          $or: [
            { $eq: ['$transport.truck', mongoose.Types.ObjectId(truck)] },
            { $eq: ['$transport.trailer', mongoose.Types.ObjectId(truck)] }
          ]
        }
      }
    },
    { $sort: { 'transport.startDate': -1 } },
    { $limit: 1 }
  ]
}
