import { PipelineStage, Types } from 'mongoose'
import { ListQueryPropsDto } from '../dto/listQueryProps.dto'

const sortingBuilder = (
  sortBy: string[] = [],
  sortDesc: boolean[] = []
): PipelineStage.Sort => {
  const fieldMapper = new Map<string, string>()
  fieldMapper.set('plannedDateStr', 'plannedDate')
  return {
    $sort: {
      [sortBy[0]]: sortDesc[0] ? -1 : 1,
    },
  }
}

export const ListPipelineBuilder = (p: ListQueryPropsDto): PipelineStage[] => {
  const firstMatcher: PipelineStage.Match = {
    $match: {
      company: new Types.ObjectId(p.company),
      isActive: true,
    },
  }

  const aggreemntLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'agreement',
        foreignField: '_id',
        as: 'agreementName',
      },
    },
    {
      $addFields: {
        agreementName: {
          $getField: {
            field: 'name',
            input: {
              $first: '$agreementName',
            },
          },
        },
      },
    },
  ]

  const pipeline: PipelineStage[] = [firstMatcher, ...aggreemntLookup]
  if (p.sortBy.length > 0) pipeline.push(sortingBuilder(p.sortBy, p.sortDesc))
  const finalFacet: PipelineStage.Facet = {
    $facet: {
      items: [
        { $skip: p.skip || 0 },
        { $limit: !!p.limit && p.limit > 0 ? p.limit : 50 },
      ],
      count: [{ $count: 'count' }],
    },
  }
  return [...pipeline, finalFacet]
}
