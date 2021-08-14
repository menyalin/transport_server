const COUNT_NEAR_DAYS = 1

export default (profile, date) => {
  const inputDate = new Date(date)
  if (!inputDate) throw new Error('wrong date format error')
  if (!profile) throw new Error('profile id is not exist')
  return [
    {
      $match: {
        company: profile,
        isActive: true,
        type: 'truck'
      }
    },
    {
      $lookup: {
        from: 'crews',
        let: { truckId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$isActive', true] },
                  { $eq: ['$truck', '$$truckId'] },
                  {
                    $lte: [
                      '$startDate',
                      {
                        $dateAdd: {
                          startDate: inputDate,
                          unit: 'day',
                          amount: 1
                        }
                      }
                    ]
                  }
                ]
              }
            }
          },
          { $sort: { startDate: -1 } }
        ],
        as: 'crews'
      }
    },
    {
      $addFields: {
        actualCrew: {
          $first: {
            $filter: {
              input: '$crews',
              as: 'crew',
              cond: { $lte: ['$$crew.startDate', inputDate] }
            }
          }
        },
        nearCrews: {
          $filter: {
            input: '$crews',
            as: 'crew',
            cond: {
              $and: [
                {
                  $gte: [
                    '$$crew.startDate',
                    {
                      $dateAdd: {
                        startDate: inputDate,
                        unit: 'day',
                        amount: COUNT_NEAR_DAYS * -1
                      }
                    }
                  ]
                },
                {
                  $lte: [
                    '$$crew.startDate',
                    {
                      $dateAdd: {
                        startDate: inputDate,
                        unit: 'day',
                        amount: COUNT_NEAR_DAYS
                      }
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    }
  ]
}
