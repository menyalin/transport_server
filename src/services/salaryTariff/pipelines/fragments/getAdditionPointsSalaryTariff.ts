import mongoose from 'mongoose'

export default (company) => {
  return [
    {
      $lookup: {
        from: 'salaryTariffs',
        let: {
          orderDate: '$_orderPeriodDate',
          orderType: '$analytics.type',
          client: '$client.client',
          tkName: '$confirmedCrew.tkName',
          liftCapacity: '$_truck.liftCapacityType',
          consigneeType: '$_consigneeType.value',
        },
        pipeline: [
          {
            $match: {
              company: mongoose.Types.ObjectId(company),
              isActive: true,
              $expr: {
                $and: [
                  { $eq: ['$type', 'additionalPoints'] },
                  { $gte: ['$$orderDate', '$date'] },
                  { $eq: ['$$orderType', '$orderType'] },
                  { $in: ['$$client', { $ifNull: ['$clients', []] }] },
                  { $in: ['$$tkName', '$tks'] },
                  { $in: ['$$liftCapacity', '$liftCapacity'] },
                  {
                    $in: [
                      '$$consigneeType',
                      { $ifNull: ['$consigneeTypes', []] },
                    ],
                  },
                ],
              },
            },
          },
          { $sort: { date: -1, sum: 1 } },
        ],
        as: '_additionalPointsTariff',
      },
    },
    {
      $addFields: {
        _additionalPointsSum: {
          $multiply: [
            {
              $ifNull: [
                {
                  $getField: {
                    field: 'sum',
                    input: { $first: '$_additionalPointsTariff' },
                  },
                },
                0,
              ],
            },
            {
              $subtract: [
                {
                  $add: [
                    1,
                    {
                      $size: {
                        $filter: {
                          input: '$_coords',
                          cond: { $gte: ['$$this.distance', 300] },
                        },
                      },
                    },
                  ],
                },
                {
                  $ifNull: [
                    {
                      $getField: {
                        field: 'includedPoints',
                        input: { $first: '$_additionalPointsTariff' },
                      },
                    },
                    0,
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $addFields: {
        _additionalPointsSum: { $max: ['$_additionalPointsSum', 0] },
      },
    },
  ]
}
