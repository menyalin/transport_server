import mongoose from 'mongoose'
import { PAIMENT_INVOICE_STATUSES } from '../../../constants/paymentInvoice.js'
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
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: 'paymentInvoices',
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
        statusStr: {
          $switch: {
            branches: PAIMENT_INVOICE_STATUSES.map((i) => ({
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


  return [...pipeline, ...group]
}
