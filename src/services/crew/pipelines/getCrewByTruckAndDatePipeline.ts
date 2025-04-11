import { Types } from 'mongoose'

export default ({ truck, date }: { truck: string; date: string }) => {
  if (!truck || !date) throw new Error('bad pipeline arguments')
  const inputDate = new Date(date)
  const firstMatcher = {
    $match: {
      transport: {
        $elemMatch: {
          $and: [
            { startDate: { $lte: inputDate } },
            {
              $or: [
                { truck: new Types.ObjectId(truck) },
                { trailer: new Types.ObjectId(truck) },
              ],
            },
            { $or: [{ endDate: { $gt: inputDate } }, { endDate: null }] },
          ],
        },
      },
    },
  }

  const secondMatcher = {
    $match: {
      'transport.startDate': { $lte: inputDate },
      $expr: {
        $or: [
          { $eq: ['$transport.truck', new Types.ObjectId(truck)] },
          { $eq: ['$transport.trailer', new Types.ObjectId(truck)] },
        ],
      },
    },
  }
  return [
    firstMatcher,
    {
      $unwind: {
        path: '$transport',
      },
    },
    secondMatcher,
    {
      $sort: {
        'transport.startDate': -1,
      },
    },
    {
      $limit: 1,
    },
  ]
}
