import { PipelineStage, Types } from 'mongoose'
import { OrderPickedForInvoiceDTO } from '@/domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import { Order as OrderModel } from '@/models'
import { paymentPartsSumWOVatFragemt } from './pipelineFragments/paymentPartsSumWOVatFragemt'
import { orderDriverFullNameBuilder } from '@/shared/pipelineFragments/orderDriverFullNameBuilder'
import {
  finalPricesFragmentBuilder,
  totalSumFragmentBuilder,
} from '@/shared/pipelineFragments/orderFinalPricesFragmentBuilder'
import { orderPlannedDateBuilder } from '@/shared/pipelineFragments/orderPlannedDateBuilder'

export const getOrdersForInvoiceDtoByOrders = async (
  orders: string[],
  company: string
): Promise<OrderPickedForInvoiceDTO[]> => {
  if (!orders || !Array.isArray(orders) || orders.length === 0)
    throw new Error('getOrdersForInvoiceDtoByOrders : orders array is missing!')
  const pipeline: PipelineStage[] = []
  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      company: new Types.ObjectId(company),
      $expr: {
        $and: [{ $in: ['$_id', orders.map((i) => new Types.ObjectId(i))] }],
      },
    },
  }
  const addFieldsForOrder: PipelineStage[] = [
    {
      $addFields: {
        orderId: '_id',
        itemType: 'order',
        agreementId: '$client.agreement',
        paymentPartsSumWOVat: paymentPartsSumWOVatFragemt,
        totalByTypes: { ...finalPricesFragmentBuilder() },
      },
    },
    {
      $addFields: {
        'totalByTypes.base': {
          $subtract: [
            '$totalByTypes.base',
            { $ifNull: ['$paymentPartsSumWOVat', 0] },
          ],
        },
      },
    },
  ]

  const unionWithPaymentPartsOrders: PipelineStage.UnionWith = {
    $unionWith: {
      coll: 'orders',
      pipeline: [
        {
          $match: {
            company: new Types.ObjectId(company),
            // $expr: {
            //   $and: [
            //     {
            //       $in: [
            //         '$paymentParts._id',
            //         orders.map((i) => new Types.ObjectId(i)),
            //       ],
            //     },
            //   ],
            // },
          },
        },
        { $unwind: { path: '$paymentParts' } },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $in: [
                    '$paymentParts._id',
                    orders.map((i) => new Types.ObjectId(i)),
                  ],
                },
              ],
            },
          },
        },

        {
          $addFields: {
            orderId: '$_id',
            _id: '$paymentParts._id',
            agreementId: '$paymentParts.agreement',
            paymentPartsSumWOVat: 0,
            itemType: 'paymentPart',
            totalByTypes: {
              base: '$paymentParts.priceWOVat',
            },
          },
        },
      ],
    },
  }

  const finalAddFields: PipelineStage[] = [
    {
      $addFields: {
        needUpdate: false,
        isSelectable: true,
        plannedDate: orderPlannedDateBuilder(),
      },
    },
    {
      $lookup: {
        from: 'agreements',
        localField: 'agreementId',
        foreignField: '_id',
        as: '_agreement',
      },
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'confirmedCrew.driver',
        foreignField: '_id',
        as: 'driver',
      },
    },
    {
      $addFields: {
        driver: { $first: '$driver' },
        _agreement: {
          $first: '$_agreement',
        },
      },
    },
    {
      $addFields: {
        driverName: orderDriverFullNameBuilder(),
        agreementVatRate: '$_agreement.vatRate',
      },
    },
    {
      $addFields: {
        total: totalSumFragmentBuilder(),
      },
    },
  ]

  pipeline.push(firstMatcher)
  pipeline.push(...addFieldsForOrder)
  pipeline.push(unionWithPaymentPartsOrders)
  pipeline.push(...finalAddFields)
  const res = await OrderModel.aggregate(pipeline)
  return res.map((i) => new OrderPickedForInvoiceDTO(i))
}
