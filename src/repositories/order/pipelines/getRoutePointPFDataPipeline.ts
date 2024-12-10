import { Order } from '@/domain/order/order.domain'
import { PipelineStage, Types } from 'mongoose'

export const getRoutePointPFDataPipeline = (order: Order): PipelineStage[] => {
  const firstMatcher: PipelineStage.Match = {
    $match: {
      $expr: {
        $and: [
          { $eq: ['$_id', new Types.ObjectId(order.id)] },
          { $eq: ['$company', new Types.ObjectId(order.company)] },
        ],
      },
    },
  }

  const unwind: PipelineStage.Unwind = {
    $unwind: {
      path: '$route',
    },
  }
  const replaceRoot: PipelineStage.ReplaceRoot = {
    $replaceRoot: {
      newRoot: '$route',
    },
  }
  const addressLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'addresses',
        localField: 'address',
        foreignField: '_id',
        as: 'tmp_address',
      },
    },
    {
      $addFields: {
        tmp_address: { $first: '$tmp_address' },
      },
    },
  ]
  const partnerLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'partners',
        localField: 'tmp_address.partner',
        foreignField: '_id',
        as: 'tmp_partner',
      },
    },
    {
      $addFields: {
        tmp_partner: { $first: '$tmp_partner' },
      },
    },
  ]
  const finalProject: PipelineStage.Project = {
    $project: {
      address: '$tmp_address.name',
      pointType: '$type',
      useInterval: '$useInterval',
      plannedDateTime: {
        $dateToString: {
          date: '$plannedDate',
          timezone: 'Europe/Moscow',
          format: '%d.%m.%Y %H:%M',
        },
      },
      intervalEndDate: {
        $dateToString: {
          date: '$intervalEndDate',
          timezone: 'Europe/Moscow',
          format: '%d.%m.%Y %H:%M',
        },
      },
      note: '$note',
      partnerName: '$tmp_partner.name',
    },
  }
  return [
    firstMatcher,
    unwind,
    replaceRoot,
    ...addressLookup,
    ...partnerLookup,
    finalProject,
  ]
}
