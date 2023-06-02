import mongoose from 'mongoose'
import { orderPlannedDateBuilder } from '../../../services/_pipelineFragments/orderPlannedDateBuilder.js'

export default function ({ company, truckIds, orderStatuses, period }) {
  return [
    {
      $match: {
        $expr: {
          $and: [
            { $eq: ['$company', mongoose.Types.ObjectId(company)] },
            { $in: ['$state.status', orderStatuses] },
            {
              $in: [
                '$confirmedCrew.truck',
                truckIds.map((id) => mongoose.Types.ObjectId(id)),
              ],
            },
            { $gte: [orderPlannedDateBuilder(), period[0]] },
            { $lt: [orderPlannedDateBuilder(), period[1]] },
          ],
        },
      },
    },
    { $addFields: { orderDate: orderPlannedDateBuilder() } },
    { $sort: { orderDate: 1 } },
  ]
}
