import { PipelineStage, Types } from 'mongoose'
import { OrderPickedForInvoiceDTO } from '@/domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import {
  GetOrdersPickedForInvoiceProps,
  GetOrdersPickedForInvoicePropsSchema,
} from '@/domain/paymentInvoice/interfaces'
import { Order as OrderModel } from '@/models'
import { orderDriverFullNameBuilder } from '@/shared/pipelineFragments/orderDriverFullNameBuilder'
import { orderDateFragmentBuilder } from '@/shared/pipelineFragments/orderDateFragmentBuilder'
import { totalByTypesFragementBuilder } from './pipelines/pipelineFragments/totalByTypesFragementBuilder'

export const getOrdersPickedForInvoiceDTOByOrders = async (
  p: GetOrdersPickedForInvoiceProps
): Promise<OrderPickedForInvoiceDTO[]> => {
  const parsedProps = GetOrdersPickedForInvoicePropsSchema.parse(p)

  if (!parsedProps.orderIds?.length)
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
        company: new Types.ObjectId(parsedProps.company),
        $expr: {
          $and: [
            {
              $in: [
                '$_id',
                parsedProps.orderIds.map((i) => new Types.ObjectId(i)),
              ],
            },
          ],
        },
      },
    },
    // ...agreementLookupBuilder('client.agreement'),
    {
      $addFields: {
        itemType: 'order',
        orderId: '$_id',
        rowId: '$_id',
        usePriceWithVat: parsedProps.usePriceWithVat,
        agreementVatRate: parsedProps.vatRate,
      },
    },
    ...totalByTypesFragementBuilder(false),
  ]

  const unionWithPaymentParts = {
    $unionWith: {
      coll: 'orders',
      pipeline: [
        {
          $match: {
            company: new Types.ObjectId(parsedProps.company),
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
                              parsedProps.orderIds.map(
                                (i) => new Types.ObjectId(i)
                              ),
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
                    parsedProps.orderIds.map((i) => new Types.ObjectId(i)),
                  ],
                },
              ],
            },
          },
        },
        // ...agreementLookupBuilder('paymentParts.agreement'),
        {
          $addFields: {
            paymentPartsSum: 0,
            agreementVatRate: parsedProps.vatRate,
            usePriceWithVat: parsedProps.usePriceWithVat,
            itemType: 'paymentPart',
            orderId: '$_id',
            rowId: '$_id',
            _id: '$paymentParts._id',
          },
        },
        ...totalByTypesFragementBuilder(true),
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
    { $unset: ['driver'] },
  ]

  const res = await OrderModel.aggregate([
    ...ordersMatcher,
    unionWithPaymentParts,
    ...driverLookup,
    ...addFields,
  ])
  return res.map((i) => new OrderPickedForInvoiceDTO(i))
}
