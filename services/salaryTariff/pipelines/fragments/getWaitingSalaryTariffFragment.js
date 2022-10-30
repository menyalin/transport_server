import mongoose from 'mongoose'
import { getDurutationInPoints } from './getDurutationInPoints.js'

export default (company) => {
  return [
    {
      $addFields: {
        _loadingDurationsMinutes: getDurutationInPoints('loading'),
        _unloadingDurationsMinutes: getDurutationInPoints('unloading'),
      },
    },
    {
      $lookup: {
        from: 'salaryTariffs',
        let: {
          orderDate: '$_orderPeriodDate',
          orderType: '$analytics.type',
          client: '$client.client',
          tkName: '$confirmedCrew.tkName',
          liftCapacity: '$_truck.liftCapacityType',

          // loadingPoint: '$_loadingAddressId',
          // lastAddress: '$_lastAddressId',
          // loadingZones: '$_loadingAddress.zones',
          // unloadingZones: '$_lastAddress.zones',
          // loadingRegion: '$_loadingAddress.region',
          // unloadingRegion: '$_lastAddress.region',
        },
        pipeline: [
          {
            $match: {
              company: mongoose.Types.ObjectId(company),
              isActive: true,
              $expr: {
                $and: [
                  { $eq: ['$type', 'waiting'] },
                  { $gte: ['$$orderDate', '$date'] },
                  { $eq: ['$$orderType', '$orderType'] },
                  { $in: ['$$client', { $ifNull: ['$clients', []] }] },
                  { $in: ['$$tkName', '$tks'] },
                  { $in: ['$$liftCapacity', '$liftCapacity'] },
                ],
              },
            },
          },
          { $sort: { date: -1, sum: 1 } },
        ],
        as: '_waitingTariff',
      },
    },
    {
      $addFields: {
        _waitingTariff: { $first: '$_waitingTariff' },
        _waitingInMinutes: {
          $map: {
            input: {
              $concatArrays: [
                '$_unloadingDurationsMinutes',
                '$_loadingDurationsMinutes',
              ],
            },
            in: {
              $max: [
                {
                  $subtract: [
                    '$$this',
                    { $multiply: [getTariffField('includeHours'), 60] },
                  ],
                },
                0,
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        _roundedMinutes: {
          $map: {
            input: '$_waitingInMinutes',
            in: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_waitingTariff.roundByHours', 0.01666666] },
                    then: '$$this',
                  }, // 1 минута
                  {
                    case: { $eq: ['$_waitingTariff.roundByHours', 0.5] },
                    then: {
                      $multiply: [{ $floor: { $divide: ['$$this', 30] } }, 30],
                    },
                  }, // 30 минут
                  {
                    case: { $eq: ['$_waitingTariff.roundByHours', 1] },
                    then: {
                      $multiply: [{ $floor: { $divide: ['$$this', 60] } }, 60],
                    },
                  }, // 1 час
                  {
                    case: { $eq: ['$_waitingTariff.roundByHours', 12] },
                    then: {
                      $multiply: [
                        { $floor: { $divide: ['$$this', 60 * 12] } },
                        60 * 12,
                      ],
                    },
                  }, // 12 часов
                  {
                    case: { $eq: ['$_waitingTariff.roundByHours', 24] },
                    then: {
                      $multiply: [
                        { $floor: { $divide: ['$$this', 60 * 24] } },
                        60 * 24,
                      ],
                    },
                  }, // 24 часа
                ],
                default: 0,
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        _waitingSum: {
          $reduce: {
            input: '$_roundedMinutes',
            initialValue: 0,
            in: {
              $add: ['$$value', { $multiply: [tariffByMinutes(), '$$this'] }],
            },
          },
        },
      },
    },
  ]
}

const getTariffField = (field) => ({
  $getField: {
    field: field,
    input: { $first: '$_waitingTariff' },
  },
})

const tariffByMinutes = () => ({
  $switch: {
    branches: [
      {
        case: { $eq: ['$_waitingTariff.tariffBy', 'hour'] },
        then: { $divide: ['$_waitingTariff.sum', 60] },
      },
      {
        case: { $eq: ['$_waitingTariff.tariffBy', 'day'] },
        then: { $divide: ['$_waitingTariff.sum', 60 * 24] },
      },
    ],
    default: 0,
  },
})
