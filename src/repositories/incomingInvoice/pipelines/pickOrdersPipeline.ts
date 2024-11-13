import { PipelineStage, Types } from 'mongoose'
import { PickOrdersPropsDTO } from '../dto/pickOrdersPropsDTO'
import { orderDateFragmentBuilder } from '@/shared/pipelineFragments/orderDateFragmentBuilder'
import { orderDriverFullNameBuilder } from '@/shared/pipelineFragments/orderDriverFullNameBuilder'
import { orderAddressesLookupBuilder } from '@/shared/pipelineFragments/orderAddressesLookupBuilder'
import { orderOutsourcePriceBuilder } from '@/shared/pipelineFragments/orderOutsourcePriceBuilder'
import { orderDocsStatusBuilder } from '@/shared/pipelineFragments/orderDocsStatusBuilder'
import { orderDocsStatusConditionBuilder } from '@/shared/pipelineFragments/orderDocsStatusConditionBuilder'

export const pickOrdersForIncomingInvoice = (
  p: PickOrdersPropsDTO
): PipelineStage[] => {
  const firstMatcher: PipelineStage.Match = {
    $match: {
      company: new Types.ObjectId(p.company),
      'state.status': 'completed',
      'confirmedCrew.outsourceAgreement': new Types.ObjectId(p.agreement),
      $expr: {
        $and: [
          { $gte: [orderDateFragmentBuilder(), p.period.start] },
          { $lt: [orderDateFragmentBuilder(), p.period.end] },
        ],
      },
    },
  }
  if (p.docStatuses?.length)
    firstMatcher.$match.$expr?.$and.push({
      $or: p.docStatuses.map((status) =>
        orderDocsStatusConditionBuilder(status)
      ),
    })

  const includeIntoInvoicesFilter: PipelineStage[] = [
    {
      $lookup: {
        from: 'incomingInvoiceOrders',
        foreignField: 'order',
        localField: '_id',
        as: 'tmp_ordersInIncomingInvoices',
      },
    },
    {
      $match: {
        $expr: { $eq: [{ $size: '$tmp_ordersInIncomingInvoices' }, 0] },
      },
    },
  ]

  const clearUnusedFields: PipelineStage.Unset = {
    $unset: [
      'startPositionDate',
      'grade',
      'prePrices',
      'prices',
      'finalPrices',
      'state',
      'createdAt',
      'updatedAt',
      'isActive',
      'isDisabled',
      'paymentToDriver',
      'paymentParts',
      'analytics',
    ],
  }

  const clientLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'partners',
        localField: 'client.client',
        foreignField: '_id',
        as: 'tmp_client',
      },
    },
    {
      $addFields: {
        clientName: {
          $getField: { field: 'name', input: { $first: '$tmp_client' } },
        },
      },
    },
    { $unset: ['tmp_client'] },
  ]

  const truckLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'trucks',
        localField: 'confirmedCrew.truck',
        foreignField: '_id',
        as: 'tmp_truck',
      },
    },
    {
      $addFields: {
        truckNum: {
          $getField: { field: 'regNum', input: { $first: '$tmp_truck' } },
        },
      },
    },
    { $unset: ['tmp_truck'] },
  ]

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
    { $addFields: { driverName: orderDriverFullNameBuilder() } },
    { $unset: ['driver'] },
  ]

  const addFields: PipelineStage.AddFields[] = [
    {
      $addFields: {
        orderDate: orderDateFragmentBuilder(),
        clientNum: '$client.num',
        clientName: '$clientName',
        truckNum: '$truckNum',
        loadingPointNames: '$loading_addresses_str',
        unloadingPointNames: '$unloading_addresses_str',
        price: '$outsourceTotalPrice',
      },
    },
    {
      $addFields: {
        orderDateStr: {
          $dateToString: {
            format: '%d.%m.%Y %H:%M',
            timezone: 'Europe/Moscow',
            date: '$orderDate',
          },
        },
      },
    },
  ]
  const baseSorting: PipelineStage.Sort = { $sort: { orderDate: 1 } }
  const clearTmpFields: PipelineStage.Unset = {
    $unset: [
      'outsourceCosts',
      'unloading_addresses',
      'loading_addresses',
      'confirmedCrew',
      'unloading_addresses_str',
      'loading_addresses_str',
      // 'route',
      'client',
      'reqTransport',
      'tmp_ordersInIncomingInvoices',
    ],
  }
  return [
    firstMatcher,
    clearUnusedFields,
    ...includeIntoInvoicesFilter,
    ...clientLookup,
    ...truckLookup,
    ...driverLookup,
    ...orderDocsStatusBuilder(),
    ...orderAddressesLookupBuilder('loading'),
    ...orderAddressesLookupBuilder('unloading'),
    ...orderOutsourcePriceBuilder(),
    ...addFields,
    clearTmpFields,
    baseSorting,
  ]
}
