import { PipelineStage, Types } from 'mongoose'
import { GetListPropsDTO } from '../dto/getListProps.dto'

export const getListPipeline = (props: GetListPropsDTO): PipelineStage[] => {
  //#region: firstMatcher
  const firstMatcher: PipelineStage.Match = {
    $match: {
      company: new Types.ObjectId(props.company),
      $expr: {
        $and: [
          { $gte: ['$date', props.period.start] },
          { $lt: ['$date', props.period.end] },
        ],
      },
    },
  }

  if (props.statuses?.length)
    firstMatcher.$match.$expr?.$and.push({ $in: ['$status', props.statuses] })
  if (props.agreements?.length)
    firstMatcher.$match.$expr?.$and.push({
      $in: ['$agreement', props.agreements.map((i) => new Types.ObjectId(i))],
    })

  if (props.number)
    firstMatcher.$match.$expr?.$and.push({
      $regexMatch: {
        input: '$number',
        regex: new RegExp(props.number, 'i'),
        options: 'i',
      },
    })
  //#endregion

  const aggrementLookup: PipelineStage.Lookup = {
    $lookup: {
      from: 'agreements',
      localField: 'agreement',
      foreignField: '_id',
      as: 'agreement',
    },
  }

  const addFields: PipelineStage.AddFields = {
    $addFields: {
      total: 0,
      agreementName: {
        $getField: { field: 'name', input: { $first: '$agreement' } },
      },
      status: {
        $switch: {
          branches: [
            {
              case: { $eq: ['$status', 'preparing'] },
              then: 'Подготовка',
            },
            {
              case: { $eq: ['$status', 'toPay'] },
              then: 'Не оплачено',
            },
            {
              case: { $eq: ['$status', 'paid'] },
              then: 'Не оплачено',
            },
          ],
          default: 'undefined status',
        },
      },
    },
  }

  const finalGroup: PipelineStage.Facet = {
    $facet: {
      items: [{ $skip: props.skip }, { $limit: props.limit }],
      totalCount: [{ $count: 'count' }],
    },
  }
  return [firstMatcher, aggrementLookup, addFields, finalGroup]
}
