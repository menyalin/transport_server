import { PipelineStage, Types } from 'mongoose'
import { OrderPickedForInvoiceDTO } from '../../domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import { Order as OrderModel } from '../../models'
import { paymentPartsSumFragment } from './pipelineFragments/paymentPartsSumFragment'
import {
  finalPricesFragmentBuilder,
  totalSumFragmentBuilder,
} from '../../services/_pipelineFragments/orderFinalPricesFragmentBuilder'
import { orderPlannedDateBuilder } from '../../services/_pipelineFragments/orderPlannedDateBuilder'
import { orderDriverFullNameBuilder } from '../../services/_pipelineFragments/orderDriverFullNameBuilder'
import { substructPaymentPartsFromBase } from './pipelineFragments/substructPaymentPartsFromBase'

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
        orderId: '$_id',
        itemType: 'order',
        agreementId: '$client.agreement',
        paymentPartsSumWOVat: paymentPartsSumFragment(false),
        paymentPartsSumWithVat: paymentPartsSumFragment(true),
        totalByTypes: { ...finalPricesFragmentBuilder() },
      },
    },
    substructPaymentPartsFromBase(),
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
            paymentPartsSumWithVat: 0,
            itemType: 'paymentPart',
            totalByTypes: {
              base: {
                priceWOVat: '$paymentParts.priceWOVat',
                price: '$paymentParts.price',
              },
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
        as: 'agreement',
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
        agreement: {
          $first: '$agreement',
        },
      },
    },
    {
      $addFields: {
        driverName: orderDriverFullNameBuilder(),
        agreementVatRate: '$agreement.vatRate',
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

  return orders
    .map((orderId) => {
      const resItem = res.find((i) => i._id.toString() === orderId)
      return resItem ? new OrderPickedForInvoiceDTO(resItem) : null
    })
    .filter((item): item is OrderPickedForInvoiceDTO => item !== null)
}
