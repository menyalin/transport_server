// @ts-nocheck
import mongoose from 'mongoose'
import { orderPlannedDateBuilder } from '../_pipelineFragments/orderPlannedDateBuilder.js'
import { orderDriverFullNameBuilder } from '../_pipelineFragments/orderDriverFullNameBuilder.js'
import { OrderInPaymentInvoice as OrderInPaymentInvoiceModel } from '../../models/index.js'
import { pricesFragmentBuilder } from './fragments/pricesFragmentBuilder.js'

export default async function getOrdersForPaymentInvoice({
  paymentInvoiceId,
  orderIds,
}) {
  const filters = []
  if (paymentInvoiceId)
    filters.push({
      $eq: ['$paymentInvoice', mongoose.Types.ObjectId(paymentInvoiceId)],
    })

  if (orderIds && orderIds.length)
    filters.push({
      $in: ['$order', orderIds.map((i) => mongoose.Types.ObjectId(i))],
    })
  const firstMatchBuilder = (filters = []) => ({
    $match: {
      $expr: {
        $and: [...filters],
      },
    },
  })

  const driverLookup = [
    {
      $lookup: {
        from: 'drivers',
        localField: 'confirmedCrew.driver',
        foreignField: '_id',
        as: 'driver',
      },
    },
    { $addFields: { driver: { $first: '$driver' } } },
  ]

  const agreementLookup = [
    {
      $addFields: {
        agreement: {
          $cond: {
            if: { $eq: ['$paymentParts._id', '$$order_id'] },
            then: '$paymentParts.agreement',
            else: '$client.agreement',
          },
        },
      },
    },
    {
      $lookup: {
        from: 'agreements',
        localField: 'agreement',
        foreignField: '_id',
        as: 'agreement',
      },
    },
    {
      $addFields: {
        agreement: { $first: '$agreement' },
        agreementVatRate: {
          $getField: {
            field: 'vatRate',
            input: { $first: '$agreement' },
          },
        },
      },
    },
  ]

  const ordersLookup = [
    {
      $lookup: {
        from: 'orders',
        let: { order_id: '$order' },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$_id', '$$order_id'] },
                  {
                    $in: [
                      '$$order_id',
                      {
                        $ifNull: [
                          {
                            $map: {
                              input: '$paymentParts',
                              in: '$$this._id',
                            },
                          },
                          [],
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            $addFields: {
              paymentPartsSumWOVat: {
                $ifNull: [
                  {
                    $reduce: {
                      input: '$paymentParts',
                      initialValue: 0,
                      in: { $add: ['$$value', '$$this.priceWOVat'] },
                    },
                  },
                  0,
                ],
              },
            },
          },
          {
            $unwind: {
              path: '$paymentParts',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$_id', '$$order_id'] },
                  { $eq: ['$paymentParts._id', '$$order_id'] },
                ],
              },
            },
          },
          ...driverLookup,
          ...agreementLookup,
          {
            $addFields: {
              orderId: '$_id',
              _id: {
                $cond: {
                  if: { $eq: ['$paymentParts._id', '$$order_id'] },
                  then: '$paymentParts._id',
                  else: '$_id',
                },
              },
              itemType: {
                $cond: {
                  if: { $eq: ['$paymentParts._id', '$$order_id'] },
                  then: 'paymentPart',
                  else: 'order',
                },
              },
              plannedDate: orderPlannedDateBuilder(),
              driverName: orderDriverFullNameBuilder(),
            },
          },
          ...pricesFragmentBuilder(),
        ],
        as: 'order',
      },
    },
    { $addFields: { order: { $first: '$order' } } },
    {
      $addFields: {
        order: {
          rowId: '$_id',
          savedTotal: '$total',
          savedTotalByTypes: '$totalByTypes',
          needUpdate: { $ne: ['$total.price', '$order.total.price'] },
        },
      },
    },
    { $replaceRoot: { newRoot: '$order' } },
  ]

  const ordersInPaymentInvoice = await OrderInPaymentInvoiceModel.aggregate([
    firstMatchBuilder(filters),
    ...ordersLookup,
  ])
  return ordersInPaymentInvoice
}
