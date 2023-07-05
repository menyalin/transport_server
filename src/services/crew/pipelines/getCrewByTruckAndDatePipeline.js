import mongoose from 'mongoose'

export default ({ truck, date, state }) => {
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
                { truck: mongoose.Types.ObjectId(truck) },
                { trailer: mongoose.Types.ObjectId(truck) },
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
      $or: [
        { 'transport.truck': mongoose.Types.ObjectId(truck) },
        { 'transport.trailer': mongoose.Types.ObjectId(truck) },
      ],

      'transport.startDate': { $lte: inputDate },
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
