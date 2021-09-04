import mongoose from 'mongoose'

export default (truck, date) => {
  if (!truck) throw new Error('bad pipeline arguments')
  let inputDate
  if (date) inputDate = new Date(date)
  else inputDate = new Date()
  return [
    {
      $match: {
        isActive: true,
        startDate: { $lte: inputDate },
        $expr: {
          $or: [
            { $eq: [{ $toBool: '$endDate' }, null] },
            { $eq: [{ $toBool: '$endDate' }, false] },
            { $gt: ['$endDate', inputDate] }
          ]
        },
        transport: {
          $elemMatch: {
            $and: [
              {
                $or: [
                  { truck: mongoose.Types.ObjectId(truck) },
                  { trailer: mongoose.Types.ObjectId(truck) }
                ]
              },
              { $or: [{ endDate: null }, { endDate: { $gt: inputDate } }] }
            ],

            startDate: { $lte: inputDate }
          }
        }
      }
    },
    {
      $unwind: {
        path: '$transport'
      }
    },
    {
      $match: {
        'transport.truck': mongoose.Types.ObjectId(truck),
        'transport.startDate': { $lte: inputDate }
      }
    },
    {
      $sort: {
        'transport.startDate': -1
      }
    },
    { $limit: 1 }
  ]
}
