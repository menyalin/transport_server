import mongoose from 'mongoose'
import { BadRequestError } from '../../../helpers/errors.js'
import { DOCUMENT_TYPES } from '../../../constants/accounting.js'
import { orderDocNumbersStringFragment } from '../../_pipelineFragments/orderDocNumbersStringBuilder.js'
import { orderDriverFullNameBuilder } from '../../_pipelineFragments/orderDriverFullNameBuilder.js'

export function getOrdersByDocsRegistryId({ docsRegistryId, orderIds }) {
  if (!docsRegistryId && !orderIds)
    throw new BadRequestError(
      'DocsRegistryService:getOrdersByDocsRegistryId: requered params is missing'
    )
  const firstMatcher = {
    $match: { $expr: { $and: [] } },
  }

  if (docsRegistryId)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$docsRegistry', mongoose.Types.ObjectId(docsRegistryId)],
    })

  if (orderIds)
    firstMatcher.$match.$expr.$and.push({
      $in: ['$order', orderIds.map((order) => mongoose.Types.ObjectId(order))],
    })

  const orderLookup = [
    {
      $lookup: {
        from: 'orders',
        localField: 'order',
        foreignField: '_id',
        as: 'order',
      },
    },
    {
      $addFields: {
        order: { $first: '$order' },
      },
    },
  ]
  const driverLookup = [
    {
      $lookup: {
        from: 'drivers',
        localField: 'order.confirmedCrew.driver',
        foreignField: '_id',
        as: 'driver',
      },
    },
    { $addFields: { driver: { $first: '$driver' } } },
  ]

  const loadingAddressLookup = [
    {
      $addFields: {
        loadingAddress: {
          $getField: {
            field: 'address',
            input: {
              $first: '$order.route',
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'addresses',
        localField: 'loadingAddress',
        foreignField: '_id',
        as: 'loadingAddress',
      },
    },
    {
      $addFields: {
        loadingAddress: { $first: '$loadingAddress' },
      },
    },
  ]

  const addFields = {
    $addFields: {
      placeName: '$loadingAddress.shortName',
      orderDate: {
        $getField: {
          field: 'plannedDate',
          input: {
            $first: '$order.route',
          },
        },
      },
      docNumbers: orderDocNumbersStringFragment({
        docsFieldName: '$order.docs',
        onlyForAddToRegistry: true,
      }),
      driverName: orderDriverFullNameBuilder(),
      routeNumber: '$order.client.num',
      docTypesStr: {
        $trim: {
          chars: ', ',
          input: {
            $reduce: {
              initialValue: '',
              input: {
                $reduce: {
                  // Удаляем одубли документов
                  input: {
                    $filter: {
                      // Оставляем только те записи, которые надо включать в опись
                      input: '$order.docs',
                      cond: { $ne: ['$$this.addToRegistry', false] },
                    },
                  },
                  initialValue: [],
                  in: {
                    $cond: [
                      { $in: ['$$this.type', '$$value'] },
                      '$$value',
                      { $concatArrays: ['$$value', ['$$this.type']] },
                    ],
                  },
                },
              },
              in: {
                $concat: [
                  '$$value',
                  {
                    $switch: {
                      branches: DOCUMENT_TYPES.map((type) => ({
                        case: { $eq: [type.value, '$$this'] },
                        then: type.text,
                      })),
                    },
                  },
                  ', ',
                ],
              },
            },
          },
        },
      },
      note: '$order.noteAccountant',
    },
  }

  return [
    firstMatcher,
    ...orderLookup,
    ...driverLookup,
    ...loadingAddressLookup,
    addFields,
  ]
}
