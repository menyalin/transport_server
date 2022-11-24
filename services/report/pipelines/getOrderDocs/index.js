import mongoose from 'mongoose'
import { BadRequestError } from '../../../../helpers/errors.js'
import { ORDER_ANALYTIC_TYPES } from '../../../../constants/order.js'

import {
  getOrderDocsStatus,
  switchCondition as switchConditionByDocsState,
} from '../fragments/orderDocsStatus.js'

import {getAddressDetails} from '../fragments/addressDetails.js'

export default ({ company, groupBy, tks, clients, state, date, driver }) => {
  if (!company)
    throw new BadRequestError('get orderDocs pipeline: no company id!')
  const firstMatcher = {
    $match: {
      isActive: true,
      'state.status': 'completed',
      company: mongoose.Types.ObjectId(company),
      $expr: {
        $and: [],
      },
    },
  }

  if (driver)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.driver', mongoose.Types.ObjectId(driver)],
    })
  if (date)
    firstMatcher.$match.$expr.$and.push({
      $lt: [
        { $getField: { field: 'plannedDate', input: { $first: '$route' } } },
        new Date(date),
      ],
    })

  if (tks && tks.length)
    firstMatcher.$match.$expr.$and.push({
      $in: [
        '$confirmedCrew.tkName',
        tks.map((i) => mongoose.Types.ObjectId(i)),
      ],
    })

  if (clients && clients.length)
    firstMatcher.$match.$expr.$and.push({
      $in: ['$client.client', clients.map((i) => mongoose.Types.ObjectId(i))],
    })

  firstMatcher.$match.$expr.$and.push(switchConditionByDocsState(state))

  const addFields = [
    {
      $lookup: {
        from: 'tknames',
        localField: 'confirmedCrew.tkName',
        foreignField: '_id',
        as: 'tkName',
      },
    },
    {
      $lookup: {
        from: 'trucks',
        localField: 'confirmedCrew.truck',
        foreignField: '_id',
        as: '_truck',
      },
    },
    {
      $lookup: {
        from: 'trucks',
        localField: 'confirmedCrew.trailer',
        foreignField: '_id',
        as: '_trailer',
      },
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'confirmedCrew.driver',
        foreignField: '_id',
        as: '_driver',
      },
    },
    {
      $lookup: {
        from: 'partners',
        localField: 'client.client',
        foreignField: '_id',
        as: '_client',
      },
    },
    {
      $addFields: { _driver: { $first: '$_driver' } },
    },
    {
      $addFields: {
        clientName: {
          $getField: {
            field: 'name',
            input: { $first: '$_client' },
          },
        },
        driverFullName: {
          $concat: [
            '$_driver.surname',
            ' ',
            '$_driver.name',
            ' ',
            '$_driver.patronymic',
          ],
        },
        truckNumStr: {
          $getField: {
            field: 'regNum',
            input: { $first: '$_truck' },
          },
        },
        trailerNumStr: {
          $getField: {
            field: 'regNum',
            input: { $first: '$_trailer' },
          },
        },
        tkNameStr: {
          $getField: {
            field: 'name',
            input: { $first: '$tkName' },
          },
        },
        orderDate: {
          $getField: {
            field: 'plannedDate',
            input: { $first: '$route' },
          },
        },
        _docsStatusObj: getOrderDocsStatus(),
        orderTypeStr: {
          $switch: {
            branches: ORDER_ANALYTIC_TYPES.map((item) => ({
              case: { $eq: [item.value, '$analytics.type'] },
              then: item.text,
            })),
            default: 'Ошибка',
          },
        },
      },
    },
  ]

  return [
    firstMatcher,
    ...addFields,
    ...getAddressDetails(),
    { $limit: 300 },
    { $sort: { orderDate: 1 } },
  ]
}
