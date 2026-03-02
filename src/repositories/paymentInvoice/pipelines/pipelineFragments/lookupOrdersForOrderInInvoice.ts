import { PipelineStage } from 'mongoose'
import { orderDriverFullNameBuilder } from '@/shared/pipelineFragments/orderDriverFullNameBuilder'
import { orderDateFragmentBuilder } from '@/shared/pipelineFragments/orderDateFragmentBuilder'
import { IInvoiceVatRateInfo } from '@/domain/paymentInvoice/interfaces'
import { totalByTypesFragementBuilder } from './totalByTypesFragementBuilder'

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

export function lookupOrdersForOrderInInvoice(
  p: IInvoiceVatRateInfo
): PipelineStage[] {
  return [
    {
      $lookup: {
        from: 'orders',
        let: { order_id: '$order' },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [{ $eq: ['$_id', '$$order_id'] }],
              },
            },
          },
          {
            $addFields: {
              usePriceWithVat: p.usePriceWithVat,
              agreementVatRate: p.vatRate,
              orderId: '$_id',
            },
          },
          ...totalByTypesFragementBuilder(),
          ...driverLookup,
          {
            $addFields: {
              plannedDate: orderDateFragmentBuilder(),
              driverName: orderDriverFullNameBuilder(),
            },
          },
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
          savedTotalByTypes: '$totalByTypes',
          isSelectable: true,
          loaderData: '$loaderData',
        },
      },
    },
    { $replaceRoot: { newRoot: '$order' } },
    {
      $unset: [
        'docsState',
        'analytics',
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
}
