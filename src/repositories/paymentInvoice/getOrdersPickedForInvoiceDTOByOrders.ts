import { PipelineStage, Types } from 'mongoose'
import { OrderPickedForInvoiceDTO } from '../../domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import {
  GetOrdersPickedForInvoiceProps,
  GetOrdersPickedForInvoicePropsSchema,
} from '../../domain/paymentInvoice/interfaces'
import { Order as OrderModel } from '../../models'
import { orderPlannedDateBuilder } from '../../services/_pipelineFragments/orderPlannedDateBuilder'
import { orderDriverFullNameBuilder } from '../../services/_pipelineFragments/orderDriverFullNameBuilder'

export const getOrdersPickedForInvoiceDTOByOrders = async ({
  orderIds,
  company,
}: GetOrdersPickedForInvoiceProps): Promise<OrderPickedForInvoiceDTO[]> => {
  GetOrdersPickedForInvoicePropsSchema.parse({ orderIds, company })
  if (!orderIds?.length)
    throw new Error(
      'getOrdersPickedForInvoiceDTOByOrders : orderIds is missing'
    )
  const driverLookup: PipelineStage[] = [
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

  const agreementLookup: PipelineStage[] = [
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

  const ordersMatcher: PipelineStage[] = [
    {
      $match: {
        company: new Types.ObjectId(company),
        $expr: {
          $and: [{ $in: ['$_id', orderIds.map((i) => new Types.ObjectId(i))] }],
        },
      },
    },
    {
      $addFields: {
        itemType: 'order',
        orderId: '$_id',
        rowId: '$_id',
        agreement: '$client.agreement',
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
    { $unset: ['paymentParts'] },
  ]

  const unionWithPaymentParts: PipelineStage[] = [
    {
      $unionWith: {
        coll: 'orders',
        pipeline: [
          {
            $match: {
              company: new Types.ObjectId(company),
              $expr: {
                $and: [
                  {
                    $gte: [
                      {
                        $size: {
                          $filter: {
                            input: { $ifNull: ['$paymentParts', []] },
                            as: 'part',
                            cond: {
                              $in: [
                                '$$part._id',
                                orderIds.map((i) => new Types.ObjectId(i)),
                              ],
                            },
                          },
                        },
                      },
                      1,
                    ],
                  },
                ],
              },
            },
          },
          { $unwind: '$paymentParts' },
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: [
                      '$paymentParts._id',
                      orderIds.map((i) => new Types.ObjectId(i)),
                    ],
                  },
                ],
              },
            },
          },
          {
            $addFields: {
              agreement: '$paymentParts.agreement',
              paymentPartsSumWOVat: 0,
              itemType: 'paymentPart',
              orderId: '$_id',
              rowId: '$_id',
              _id: '$paymentParts._id',
            },
          },
        ],
      },
    },
  ]

  const addFields: PipelineStage[] = [
    {
      $addFields: {
        plannedDate: orderPlannedDateBuilder(),
        driverName: orderDriverFullNameBuilder(),
      },
    },
  ]

  const res = await OrderModel.aggregate([
    ...ordersMatcher,
    ...unionWithPaymentParts,
    ...driverLookup,
    ...agreementLookup,
    ...addFields,
  ])
  return res.map((i) => new OrderPickedForInvoiceDTO(i))
}
