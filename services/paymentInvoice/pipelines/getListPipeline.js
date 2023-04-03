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
  if (status) firstMatcher.$match.$expr.$and.push({ $eq: ['$status', status] })

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
    { $addFields: { clientName: '$_client.name' } },
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

  const priceLookup = [
    {
      $lookup: {
        from: 'ordersInPaymentInvoices',
        localField: '_id',
        foreignField: 'paymentInvoice',
        as: '_orders',
      },
    },
    {
      $addFields: {
        total: {
          $reduce: {
            initialValue: { price: 0, priceWOVat: 0 },
            input: '$_orders',
            in: {
              price: { $add: ['$$this.total.price', '$$value.price'] },
              priceWOVat: {
                $add: ['$$this.total.priceWOVat', '$$value.priceWOVat'],
              },
            },
          },
        },
        count: { $size: '$_orders' },
      },
    },
  ]

  const pipeline = [
    firstMatcher,
    ...clientLookup,
    ...additionalFields,
    ...priceLookup,
  ]

  return [...pipeline, ...group]
}
