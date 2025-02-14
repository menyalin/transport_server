import { Types } from 'mongoose'

export default (truck: string) => {
  if (!truck) throw new Error('bad pipeline arguments')

  return [
    {
      $match: {
        isActive: true,
        $or: [
          { 'transport.truck': new Types.ObjectId(truck) },
          { 'transport.trailer': new Types.ObjectId(truck) },
        ],
      },
    },
    {
      $unwind: { path: '$transport' },
    },
    {
      $match: {
        $expr: {
          $or: [
            { $eq: ['$transport.truck', new Types.ObjectId(truck)] },
            { $eq: ['$transport.trailer', new Types.ObjectId(truck)] },
          ],
        },
      },
    },
    { $sort: { 'transport.startDate': -1 } },
    { $limit: 1 },
  ]
}
