import mongoose from 'mongoose'

export default ({ company, period }) => {
  const startPeriod = new Date(period[0])
  const endPeriod = new Date(period[1])

  const orderPeriodDate = {
    $getField: {
      field: 'plannedDate',
      input: {
        $first: '$route',
      },
    },
  }

  const firstMatcher = {
    $match: {
      company: mongoose.Types.ObjectId(company),
      isActive: true,
      $expr: {
        $and: [
          { $lt: [orderPeriodDate, endPeriod] },
          { $gte: [orderPeriodDate, startPeriod] },
          { $ne: [{ $ifNull: ['$confirmedCrew.driver', null] }, null] },
        ],
      },
    },
  }

  const driverFilter = [
    {
      $lookup: {
        from: 'drivers',
        localField: 'confirmedCrew.driver',
        foreignField: '_id',
        as: '_driver',
      },
    },
    { $addFields: { _driver: { $first: '$_driver' } } },
    { $match: { '_driver.isCalcSalary': true, isActive: true } },
  ]

  const truckLookup = [
    {
      $lookup: {
        from: 'trucks',
        localField: 'confirmedCrew.truck',
        foreignField: '_id',
        as: '_truck',
      },
    },
  ]

  const addFields = [
    {
      $addFields: {
        _orderTKNameId: '$confirmedCrew.tkName',
        _orderPeriodDate: orderPeriodDate,
        _truck: {
          $first: '$_truck',
        },
        _loadingAddressId: {
          $getField: {
            field: 'address',
            input: { $first: '$route' },
          },
        },
        _lastAddressId: {
          $getField: {
            field: 'address',
            input: {
              $last: {
                $filter: {
                  input: '$route',
                  cond: { $ne: ['$$this.isReturn', true] },
                },
              },
            },
          },
        },
      },
    },
  ]

  const addressesLookup = [
    {
      $lookup: {
        from: 'addresses',
        localField: '_loadingAddressId',
        foreignField: '_id',
        as: '_loadingAddress',
      },
    },
    {
      $lookup: {
        from: 'addresses',
        localField: '_lastAddressId',
        foreignField: '_id',
        as: '_lastAddress',
      },
    },
    {
      $addFields: {
        _loadingAddress: { $first: '$_loadingAddress' },
        _lastAddress: { $first: '$_lastAddress' },
      },
    },
  ]

  const baseTariffs = [
    {
      $lookup: {
        from: 'salaryTariffs',
        let: {
          orderDate: '$_orderPeriodDate',
          liftCapacity: '$_truck.liftCapacityType',
          loadingPoint: '$_loadingAddressId',
          lastAddress: '$_lastAddressId',
          loadingZones: '$_loadingAddress.zones',
          unloadingZones: '$_lastAddress.zones',
          loadingRegion: '$_loadingAddress.region',
          unloadingRegion: '$_lastAddress.region',
        },
        pipeline: [
          {
            $match: {
              company: mongoose.Types.ObjectId(company),
              isActive: true,
              $expr: {
                $and: [
                  { $gte: ['$$orderDate', '$date'] },
                  { $in: ['$$liftCapacity', '$liftCapacity'] },
                  {
                    $or: [
                      {
                        $and: [
                          { $eq: ['points', '$type'] },
                          { $eq: ['$$loadingPoint', '$loading'] },
                          { $eq: ['$$lastAddress', '$unloading'] },
                        ],
                      },
                      {
                        $and: [
                          { $eq: ['zones', '$type'] },
                          { $in: ['$loadingZone', '$$loadingZones'] },
                          { $in: ['$unloadingZone', '$$unloadingZones'] },
                        ],
                      },
                      {
                        $and: [
                          { $eq: ['regions', '$type'] },
                          { $eq: ['$loadingRegion', '$$loadingRegion'] },
                          { $eq: ['$unloadingRegion', '$$unloadingRegion'] },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
          { $sort: { date: -1, sum: 1 } },
          {
            $group: {
              _id: '$type',
              tariff: {
                $first: '$$ROOT',
              },
            },
          },
        ],
        as: '_baseTariffs',
      },
    },
    {
      $addFields: {
        _baseTariff: {
          $ifNull: [
            {
              $first: {
                $filter: {
                  input: '$_baseTariffs',
                  cond: {
                    $eq: ['$$this._id', 'points'],
                  },
                },
              },
            },
            {
              $first: {
                $filter: {
                  input: '$_baseTariffs',
                  cond: { $eq: ['$$this._id', 'zones'] },
                },
              },
            },
            {
              $first: {
                $filter: {
                  input: '$_baseTariffs',
                  cond: { $eq: ['$$this._id', 'regions'] },
                },
              },
            },
            { tariff: { sum: 0 } },
          ],
        },
      },
    },
  ]

  const group = {
    $group: {
      _id: '$confirmedCrew.driver',
      payment: {
        $sum: '$paymentToDriver.sum',
      },
      items: {
        $push: '$$ROOT._id',
      },
      totalCount: {
        $count: {},
      },
      base: { $sum: '$_baseTariff.tariff.sum' },
    },
  }
  return [
    firstMatcher,
    ...driverFilter,
    ...truckLookup,
    ...addFields,
    ...addressesLookup,
    ...baseTariffs,
    group,
    { $sort: { base: -1 } },
  ]
}
