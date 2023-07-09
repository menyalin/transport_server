// @ts-nocheck
import mongoose from 'mongoose'
import { orderPlannedDateBuilder } from '../../../services/_pipelineFragments/orderPlannedDateBuilder'

export default function ({ company, truckIds, orderStatuses, period }) {
  return [
    {
      $match: {
        $expr: {
          $and: [
            { $eq: ['$company', new mongoose.Types.ObjectId(company)] },
            { $in: ['$state.status', orderStatuses] },
            {
              $in: [
                '$confirmedCrew.truck',
                truckIds.map((id) => new mongoose.Types.ObjectId(id)),
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
