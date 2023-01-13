import mongoose from 'mongoose'
import { DOCS_REGISTRY_STATUSES } from '../../../constants/docsRegistry.js'
import { BadRequestError } from '../../../helpers/errors.js'

export const getListPipeline = ({ clients, company, limit, skip, status }) => {
  if (!company) throw new BadRequestError('docsRegistry: bad request params')
  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      $expr: {
        $and: [],
      },
    },
  }

  if (clients && clients.length) {
    firstMatcher.$match.$expr.$and.push({
      $in: ['$client', clients.map((i) => mongoose.Types.ObjectId(i))],
    })
  }

  // if (driver) firstMatcher.$match.driver = mongoose.Types.ObjectId(driver)

  if (status) firstMatcher.$match.$expr.$and.push({ $eq: ['$status', status] })

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

  const group = [
    // sorting(sortBy, sortDesc),
    {
      $group: {
        _id: 'docsRegistries',
        items: { $push: '$$ROOT' },
      },
    },
    {
      $addFields: {
        count: { $size: '$items' },
        items: { $slice: ['$items', +skip, +limit] },
      },
    },
  ]
  const clientLookup = [
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

  const additionalFields = [
    {
      $addFields: {
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
  const pipeline = [firstMatcher, ...clientLookup, ...additionalFields]

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
