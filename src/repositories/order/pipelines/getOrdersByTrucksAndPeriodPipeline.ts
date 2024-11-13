import { PipelineStage, Types } from 'mongoose'
import { DateRange } from '@/classes/dateRange'
import { orderDateFragmentBuilder } from '@/shared/pipelineFragments/orderDateFragmentBuilder'

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
            { $gte: [orderDateFragmentBuilder(), period.start] },
            { $lt: [orderDateFragmentBuilder(), period.end] },
          ],
        },
      },
    },
    { $addFields: { orderDate: orderDateFragmentBuilder() } },
    { $sort: { orderDate: 1 } },
  ]
}
