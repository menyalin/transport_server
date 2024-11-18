import { orderDateFragmentBuilder } from '@/shared/pipelineFragments/orderDateFragmentBuilder'
import { orderDriverFullNameBuilder } from '@/shared/pipelineFragments/orderDriverFullNameBuilder'
import { orderOutsourcePriceBuilder } from '@/shared/pipelineFragments/orderOutsourcePriceBuilder'
import { PipelineStage, Types } from 'mongoose'

export const getInvoiceOrdersPipeline = (
  invoiceId: string,
  limit = 100,
  skip = 0
): PipelineStage[] => {
  const firstMatcher: PipelineStage.Match = {
    $match: {
      incomingInvoice: new Types.ObjectId(invoiceId),
    },
  }

  const orderLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'orders',
        localField: 'order',
        foreignField: '_id',
        as: 'tmp_raw_order',
      },
    },
    {
      $addFields: {
        tmp_raw_order: { $first: '$tmp_raw_order' },
      },
    },
  ]
  const driverLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'drivers',
        localField: 'tmp_raw_order.confirmedCrew.driver',
        foreignField: '_id',
        as: 'driver',
      },
    },
    { $addFields: { driver: { $first: '$driver' } } },
  ]
  const addFields: PipelineStage.AddFields = {
    $addFields: {
      orderId: '$tmp_raw_order._id',
      orderDate: {
        $dateToString: {
          format: '%d.%m.%Y',
          date: orderDateFragmentBuilder('tmp_raw_order.route'),
          timezone: '+03:00',
        },
      },
      orderNum: '$tmp_raw_order.client.num',
      driverName: orderDriverFullNameBuilder(),
      total: {
        priceWithVat: '$total.price',
        priceWOVat: '$total.priceWOVat',
      },
      note: '$tmp_raw_order.note',
    },
  }
  const finalFacet: PipelineStage.Facet = {
    $facet: {
      total: [
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalPriceWithVat: { $sum: '$total.price' },
            totalPriceWOVat: { $sum: '$total.priceWOVat' },
          },
        },
      ],

      items: [{ $skip: skip }, { $limit: limit }],
    },
  }
  return [
    firstMatcher,
    ...orderLookup,
    ...driverLookup,
    addFields,
    ...orderOutsourcePriceBuilder('$tmp_raw_order.outsourceCosts'),
    finalFacet,
  ]
}
