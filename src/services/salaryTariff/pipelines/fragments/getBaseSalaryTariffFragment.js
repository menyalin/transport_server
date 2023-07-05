import mongoose from 'mongoose'

export default (company) => {
  return [
    {
      $lookup: {
        from: 'salaryTariffs',
        let: {
          orderDate: '$_orderPeriodDate',
          liftCapacity: '$_truck.liftCapacityType',
          tkName: '$confirmedCrew.tkName',
          loadingPoint: '$_loadingAddressId',
          lastAddress: '$_lastAddressId',
          loadingZones: '$_loadingAddress.zones',
          unloadingZones: '$_lastAddress.zones',
          loadingRegion: '$_loadingAddress.region',
          unloadingRegion: '$_lastAddress.region',
          consigneeType: '$_consigneeType.value',
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
                  { $in: ['$$tkName', '$tks'] },
                  {
                    $in: [
                      '$$consigneeType',
                      { $ifNull: ['$consigneeTypes', []] },
                    ],
                  },
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
              tariff: { $first: '$$ROOT' },
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
                  cond: { $eq: ['$$this._id', 'points'] },
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
}
