import { BooleanExpression, PipelineStage, Types } from 'mongoose'
import { OrderInPaymentInvoice as OrderInPaymentInvoiceModel } from '../../models'
import { OrderPickedForInvoiceDTO } from '../../domain/paymentInvoice/dto/orderPickedForInvoice.dto'
import { IGetOrdersForPaymentInvoiceProps } from '../../domain/paymentInvoice/interfaces'
import { orderPlannedDateBuilder } from '../../services/_pipelineFragments/orderPlannedDateBuilder'
import { orderDriverFullNameBuilder } from '../../services/_pipelineFragments/orderDriverFullNameBuilder'
import { pricesFragmentBuilder } from '../../services/paymentInvoice/fragments/pricesFragmentBuilder'

export async function getOrdersForPaymentInvoice({
  paymentInvoiceId,
  orderIds,
}: IGetOrdersForPaymentInvoiceProps) {
  const filters = []
  if (paymentInvoiceId)
    filters.push({
      $eq: ['$paymentInvoice', new Types.ObjectId(paymentInvoiceId)],
    })
  else if (orderIds && orderIds.length)
    filters.push({
      $in: ['$order', orderIds.map((i) => new Types.ObjectId(i))],
    })

  const firstMatchBuilder = (
    filters: BooleanExpression[] = []
  ): PipelineStage.Match => ({
    $match: {
      $expr: {
        $and: filters as BooleanExpression[],
      },
    },
  })

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

  const ordersLookup: PipelineStage[] = [
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
                            $map: { input: '$paymentParts', in: '$$this._id' },
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
        ] as any[],
        as: 'order',
      },
    },
    { $addFields: { order: { $first: '$order' } } },
    {
      $addFields: {
        order: {
          rowId: '$_id',
          savedTotal: '$total',
          loaderData: '$loaderData',
          savedTotalByTypes: '$totalByTypes',
          needUpdate: { $ne: ['$total.price', '$order.total.price'] },
        },
      },
    },
    { $replaceRoot: { newRoot: '$order' } },
    {
      $unset: [
        // 'docs',
        // 'agreement',
        'docsState',
        // 'route',
        'totalByTypes',
        // 'savedTotalByTypes',
        'analytics',
        'prePrices',
        'prices',
        'finalPrices',
        'loaderData.route',
        'loaderData.truck',
        'loaderData.driver',
        'loaderData.truckType',
        'loaderData.isTruckTypeEqual',
        'loaderData.isTruckEqual',
        'loaderData.isDriverEqual',
        'loaderData.isPriceEqual',
      ],
    },
  ]

  const ordersInPaymentInvoice = await OrderInPaymentInvoiceModel.aggregate([
    firstMatchBuilder(filters as BooleanExpression[]),
    ...ordersLookup,
  ])
  return ordersInPaymentInvoice.map((i) => new OrderPickedForInvoiceDTO(i))
}
