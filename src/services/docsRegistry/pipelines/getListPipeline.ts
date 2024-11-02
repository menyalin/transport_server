import { PipelineStage, Types } from 'mongoose'
import { DOCS_REGISTRY_STATUSES } from '../../../constants/docsRegistry'
import { BadRequestError } from '../../../helpers/errors'

interface IProps {
  clients: string[]
  company: string
  limit: string
  skip: string
  status?: string
  agreement?: string
}

export const getListPipeline = ({
  clients,
  company,
  limit,
  skip,
  status,
}: IProps): PipelineStage[] => {
  if (!company) throw new BadRequestError('docsRegistry: bad request params')
  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      company: new Types.ObjectId(company),
      $expr: {
        $and: [],
      },
    },
  }

  if (clients && clients.length) {
    firstMatcher.$match.$expr?.$and.push({
      $in: ['$client', clients.map((i) => new Types.ObjectId(i))],
    })
  }

  if (status) firstMatcher.$match.$expr?.$and.push({ $eq: ['$status', status] })

  // const sorting = (sortBy, sortDesc) => {
  //   const res = { $sort: {} }
  //   if (!sortBy || sortBy.length === 0)
  //     return {
  //       $sort: {
  //         date: 1,
  //       },
  //     }
  //   else
  //     sortBy.forEach((val, idx) => {
  //       res.$sort[val] = sortDesc[idx] === 'true' ? -1 : 1
  //     })
  //   return res
  // }

  const group: PipelineStage[] = [
    { $sort: { createdAt: -1 } },
    { $group: { _id: 'docsRegistries', items: { $push: '$$ROOT' } } },
    {
      $addFields: {
        count: { $size: '$items' },
        items: { $slice: ['$items', +skip, +limit] },
      },
    },
  ]
  const clientLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'partners',
        localField: 'client',
        foreignField: '_id',
        as: '_client',
      },
    },
    { $addFields: { _client: { $first: '$_client' } } },
  ]

  const agreementLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'agreement',
        foreignField: '_id',
        as: 'agreement',
      },
    },
    { $addFields: { agreement: { $first: '$agreement' } } },
  ]

  const additionalFields: PipelineStage[] = [
    {
      $addFields: {
        agreementName: '$agreement.name',
        _placeName: {
          $getField: {
            field: 'title',
            input: {
              $first: {
                $filter: {
                  input: '$_client.placesForTransferDocs',
                  cond: { $eq: ['$$this.address', '$placeForTransferDocs'] },
                },
              },
            },
          },
        },
        statusStr: {
          $switch: {
            branches: DOCS_REGISTRY_STATUSES.map((i) => ({
              case: { $eq: ['$status', i.value] },
              then: i.text,
            })),
            default: 'unexpected status',
          },
        },
      },
    },
  ]
  const pipeline = [
    firstMatcher,
    ...clientLookup,
    ...agreementLookup,
    ...additionalFields,
  ]

  // if (searchStr) {
  //   pipeline.push({
  //     $match: {
  //       $expr: {
  //         $or: [
  //           {
  //             $regexMatch: {
  //               input: '$number',
  //               regex: new RegExp(searchStr),
  //               options: 'i',
  //             },
  //           },
  //           {
  //             $regexMatch: {
  //               input: '$note',
  //               regex: new RegExp(searchStr),
  //               options: 'i',
  //             },
  //           },
  //           {
  //             $regexMatch: {
  //               input: '$_worker.name',
  //               regex: new RegExp(searchStr),
  //               options: 'i',
  //             },
  //           },
  //         ],
  //       },
  //     },
  //   })
  // }

  return [...pipeline, ...group]
}
