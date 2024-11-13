import { PipelineStage } from 'mongoose'
import { orderDriverFullNameBuilder } from '@/shared/pipelineFragments/orderDriverFullNameBuilder'
import { orderDateFragmentBuilder } from '@/shared/pipelineFragments/orderDateFragmentBuilder'

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

export function lookupOrdersForOrderInInvoice(): PipelineStage[] {
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
              agreement: '$client.agreement',
              itemType: 'order',
              orderId: '$_id',
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
            $unset: ['paymentParts'],
          },
          {
            $unionWith: {
              coll: 'orders',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: [
                        '$$order_id',
                        {
                          $map: {
                            input: { $ifNull: ['$paymentParts', []] },
                            in: '$$this._id',
                          },
                        },
                      ],
                    },
                  },
                },
                { $unwind: '$paymentParts' },
                {
                  $match: {
                    $expr: {
                      $eq: ['$$order_id', '$paymentParts._id'],
                    },
                  },
                },
                {
                  $addFields: {
                    orderId: '$_id',
                    _id: '$paymentParts._id',
                    itemType: 'paymentPart',
                    agreement: '$paymentParts.agreement',
                    paymentPartsSumWOVat: 0,
                  },
                },
              ],
            },
          },
          ...driverLookup,
          ...agreementLookup,
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
