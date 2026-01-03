import { PipelineStage, Types } from 'mongoose'
import { OrderPickedForInvoiceDTO } from '@/domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import {
  GetOrdersPickedForInvoiceProps,
  GetOrdersPickedForInvoicePropsSchema,
} from '@/domain/paymentInvoice/interfaces'
import { Order as OrderModel } from '@/models'
import { orderDriverFullNameBuilder } from '@/shared/pipelineFragments/orderDriverFullNameBuilder'
import { orderDateFragmentBuilder } from '@/shared/pipelineFragments/orderDateFragmentBuilder'
import { agreementLookupBuilder } from '@/shared/pipelineFragments/agreementLookupBuilder'
import { paymentPartsSumBuilder } from '@/shared/pipelineFragments/paymentPartsSumBuilder'
import { calcTotalBuilder } from '@/shared/pipelineFragments/calcTotalBuilder'
import { recalcTotalByTypesFragmentBuilder } from './pipelineFragments/orderFinalPricesFragmentBuilder'
import { finalPricesFragmentBuilder } from './pipelineFragments/orderFinalPricesFragmentBuilder'

export const getOrdersPickedForInvoiceDTOByOrders = async ({
  orderIds,
  company,
  vatRate,
}: GetOrdersPickedForInvoiceProps): Promise<OrderPickedForInvoiceDTO[]> => {
  GetOrdersPickedForInvoicePropsSchema.parse({ orderIds, company, vatRate })
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

  const ordersMatcher: PipelineStage[] = [
    {
      $match: {
        company: new Types.ObjectId(company),
        $expr: {
          $and: [{ $in: ['$_id', orderIds.map((i) => new Types.ObjectId(i))] }],
        },
      },
    },
    ...agreementLookupBuilder('client.agreement'),
    {
      $addFields: {
        itemType: 'order',
        orderId: '$_id',
        rowId: '$_id',
        vatRate,

        paymentPartsSum: paymentPartsSumBuilder(),
      },
    },
    { $unset: ['paymentParts'] },
    {
      $addFields: {
        totalByTypes: finalPricesFragmentBuilder(),
      },
    },
    {
      $addFields: {
        totalByTypes: {
          $mergeObjects: [
            '$totalByTypes',
            {
              base: {
                $subtract: ['$totalByTypes.base', '$paymentPartsSum'],
              },
            },
          ],
        },
      },
    },
    {
      $addFields: {
        totalByTypes: recalcTotalByTypesFragmentBuilder(),
      },
    },
    {
      $addFields: {
        total: calcTotalBuilder(),
      },
    },
  ]

  const unionWithPaymentParts = {
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
        ...agreementLookupBuilder('paymentParts.agreement'),
        {
          $addFields: {
            paymentPartsSum: 0,
            agreementVatRate: vatRate,
            itemType: 'paymentPart',
            orderId: '$_id',
            rowId: '$_id',
            _id: '$paymentParts._id',
          },
        },
        {
          $addFields: {
            totalByTypes: finalPricesFragmentBuilder(),
          },
        },
        {
          $addFields: {
            totalByTypes: recalcTotalByTypesFragmentBuilder(['base']),
          },
        },
        {
          $addFields: {
            total: calcTotalBuilder(),
          },
        },
      ],
    },
  } as PipelineStage

  const addFields: PipelineStage[] = [
    {
      $addFields: {
        plannedDate: orderDateFragmentBuilder(),
        driverName: orderDriverFullNameBuilder(),
      },
    },
  ]

  const res = await OrderModel.aggregate([
    ...ordersMatcher,
    unionWithPaymentParts,
    ...driverLookup,
    ...addFields,
  ])
  return res.map((i) => new OrderPickedForInvoiceDTO(i))
}
