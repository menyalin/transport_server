import { PipelineStage, Types } from 'mongoose'
import { PAIMENT_INVOICE_STATUSES } from '../../../constants/paymentInvoice'
import { BadRequestError } from '../../../helpers/errors'

interface IProps {
  clients: string[]
  company: string
  limit: string
  skip: string
  status: string
  search: string
}

export const getListPipeline = ({
  clients,
  company,
  limit,
  skip,
  status,
  search,
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

  if (search) {
    firstMatcher.$match.$expr.$and.push({
      $or: [{ $regexMatch: { input: '$number', regex: search, options: 'i' } }],
    })
  }

  if (clients && clients.length) {
    firstMatcher.$match.$expr.$and.push({
      $in: ['$client', clients.map((i) => new Types.ObjectId(i))],
    })
  }
  if (status) firstMatcher.$match.$expr.$and.push({ $eq: ['$status', status] })

  const group: PipelineStage[] = [
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
        as: '_agreement',
      },
    },
    { $addFields: { _agreement: { $first: '$_agreement' } } },
  ]

  const additionalFields = [
    {
      $addFields: {
        clientName: '$_client.name',
        agreementName: '$_agreement.name',
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
        count: {
          $size: {
            $filter: {
              input: '$_orders',
              cond: { $ne: ['$$this.itemType', 'paymentPart'] },
            },
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
    ...priceLookup,
  ]

  return [...pipeline, ...group]
}
