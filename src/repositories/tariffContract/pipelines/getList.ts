import { PipelineStage, Types } from 'mongoose'
import { ListQueryPropsDto } from '../dto/listQueryProps.dto'

const sortingBuilder = (
  sortBy: string[] = [],
  sortDesc: boolean[] = []
): PipelineStage.Sort => {
  const fieldMapper = new Map<string, string>()
  fieldMapper.set('plannedDateStr', 'plannedDate')
  fieldMapper.set('nestedFiles', 'nestedFiles')
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
      $expr: {
        $and: [],
      },
    },
  }

  const aggreemntLookup: PipelineStage[] = [
    {
      $addFields: {
        _agreementIds: { $ifNull: ['$agreements', '$agreement'] },
      },
    },
    {
      $lookup: {
        from: 'agreements',
        localField: '_agreementIds',
        foreignField: '_id',
        as: 'agreementsName',
      },
    },
    {
      $addFields: {
        agreementsName: {
          $map: {
            input: '$agreementsName',
            as: 'item',
            in: {
              $getField: {
                input: '$$item',
                field: 'name',
              },
            },
          },
        },
      },
    },
  ]
  if (p.agreements.length) {
    firstMatcher.$match.$expr?.$and.push({
      $in: ['$agreement', p.agreements.map((i) => new Types.ObjectId(i))],
    })
  }
  if (p.searchStr)
    firstMatcher.$match.$expr?.$and.push({
      $or: [
        {
          $regexMatch: {
            input: '$name',
            regex: p.searchStr,
            options: 'i',
          },
        },
        {
          $regexMatch: {
            input: '$note',
            regex: p.searchStr,
            options: 'i',
          },
        },
      ],
    })

  const nestedFilesLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'files',
        localField: '_id',
        foreignField: 'docId',
        as: 'nestedFiles',
      },
    },
    {
      $addFields: {
        nestedFiles: {
          $size: '$nestedFiles',
        },
      },
    },
  ]

  const pipeline: PipelineStage[] = [
    firstMatcher,
    ...aggreemntLookup,
    {
      $unset: [
        'directDistanceZonesTariffs',
        'additionalPointsTariffs',
        'zonesTariffs',
        '_agreementIds',
        'returnPercentTariffs',
        'idleTimeTariffs',
        'agreement',
        'agreements',
        'isActive',
      ],
    },
    ...nestedFilesLookup,
  ]
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
