import { PipelineStage, Types } from 'mongoose'
import { orderPlannedDateBuilder } from '../../../services/_pipelineFragments/orderPlannedDateBuilder'
import { DateRange } from '../../../classes/dateRange'

export interface IGetOrdersByTrucksAndPeriodPipelineProps {
  company: string
  truckIds: string[]
  orderStatuses: string[]
  period: DateRange
}

export function getOrdersByTrucksAndPeriodPipeline({
  company,
  truckIds,
  orderStatuses,
  period,
}: IGetOrdersByTrucksAndPeriodPipelineProps): PipelineStage[] {
  return [
    {
      $match: {
        $expr: {
          $and: [
            { $eq: ['$company', new Types.ObjectId(company)] },
            { $in: ['$state.status', orderStatuses] },
            {
              $in: [
                '$confirmedCrew.truck',
                truckIds.map((id) => new Types.ObjectId(id)),
              ],
            },
            { $gte: [orderPlannedDateBuilder(), period.start] },
            { $lt: [orderPlannedDateBuilder(), period.end] },
          ],
        },
      },
    },
    { $addFields: { orderDate: orderPlannedDateBuilder() } },
    { $sort: { orderDate: 1 } },
  ]
}
