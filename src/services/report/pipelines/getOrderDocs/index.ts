// @ts-nocheck
import mongoose from 'mongoose'
import { BadRequestError } from '../../../../helpers/errors'
import { ORDER_ANALYTIC_TYPES } from '../../../../constants/order'

import {
  getOrderDocsStatus,
  switchCondition as switchConditionByDocsState,
} from '../fragments/orderDocsStatus'

import { getAddressDetails } from '../fragments/addressDetails'

export default ({
  company,
  groupBy,
  tks,
  clients,
  state,
  truck,
  date,
  driver,
  getDocsDays,
  reviewDocsDays,
}) => {
  if (!company)
    throw new BadRequestError('get orderDocs pipeline: no company id!')
  const firstMatcher = {
    $match: {
      isActive: true,
      'state.status': 'completed',
      company: new mongoose.Types.ObjectId(company),
      $expr: {
        $and: [],
      },
    },
  }

  if (truck)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.truck', new mongoose.Types.ObjectId(truck)],
    })
  if (driver)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.driver', new mongoose.Types.ObjectId(driver)],
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
        tks.map((i) => new mongoose.Types.ObjectId(i)),
      ],
    })

  if (clients && clients.length)
    firstMatcher.$match.$expr.$and.push({
      $in: [
        '$client.client',
        clients.map((i) => new mongoose.Types.ObjectId(i)),
      ],
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
        getDocsDays: {
          $dateDiff: {
            startDate: {
              $getField: {
                field: 'plannedDate',
                input: { $first: '$route' },
              },
            },
            endDate: { $ifNull: ['$docsState.date', '$$NOW'] },
            unit: 'day',
          },
        },
        reviewDocsDays: {
          $cond: {
            if: { $ne: [{ $ifNull: ['$docsState.date', null] }, null] },
            then: {
              $dateDiff: {
                startDate: '$docsState.date',
                endDate: {
                  $ifNull: [
                    {
                      $getField: { field: 'date', input: { $first: '$docs' } },
                    },
                    '$$NOW',
                  ],
                },
                unit: 'day',
              },
            },
            else: null,
          },
        },
        reviewDate: {
          $getField: {
            input: { $first: '$docs' },
            field: 'date',
          },
        },
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

  const secondMatcher = {
    $match: {
      $expr: {
        $and: [],
      },
    },
  }
  if (getDocsDays)
    secondMatcher.$match.$expr.$and.push(
      daysCondition(getDocsDays, '$getDocsDays')
    )

  if (reviewDocsDays)
    secondMatcher.$match.$expr.$and.push(
      daysCondition(reviewDocsDays, '$reviewDocsDays')
    )

  const group = [
    {
      $group: {
        _id: 'reportData',
        items: { $push: '$$ROOT' },
        totalCount: { $count: {} },
      },
    },
    {
      $addFields: {
        notGettedCount: {
          $size: {
            $filter: {
              input: '$items',
              cond: { $eq: ['$$this._docsStatusObj.value', 'notGetted'] },
            },
          },
        },
        reviewCount: {
          $size: {
            $filter: {
              input: '$items',
              cond: { $eq: ['$$this._docsStatusObj.value', 'review'] },
            },
          },
        },
        correctionCount: {
          $size: {
            $filter: {
              input: '$items',
              cond: { $eq: ['$$this._docsStatusObj.value', 'correction'] },
            },
          },
        },
      },
    },
  ]

  return [
    firstMatcher,
    ...addFields,
    ...getAddressDetails(),
    secondMatcher,
    { $limit: 300 },
    { $sort: { orderDate: 1 } },
    ...group,
  ]
}

const daysCondition = (intervalVariant, fieldName) => {
  // const daysIntervalItems = [
  //   { text: '< 10', value: 1 },
  //   { text: '10 - 20', value: 2 },
  //   { text: '20 - 30', value: 3 },
  //   { text: ' > 30 ', value: 4 },
  // ]
  switch (intervalVariant) {
    case 1:
      return {
        $and: [{ $lt: [fieldName, 10] }, { $ne: [fieldName, null] }],
      }
    case 2:
      return {
        $and: [{ $gte: [fieldName, 10] }, { $lt: [fieldName, 20] }],
      }
    case 3:
      return {
        $and: [{ $gte: [fieldName, 20] }, { $lt: [fieldName, 30] }],
      }
    case 4:
      return {
        $gte: [fieldName, 30],
      }
    default:
      return null
  }
}
