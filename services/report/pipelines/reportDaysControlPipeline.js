import pkg from 'mongoose'
const { Types } = pkg

export default (dayLimit = 30, profile) => {
  const drivers = [
    {
      $match: {
        company: Types.ObjectId(profile)
      }
    },
    {
      $project: {
        collection: 'drivers',
        name: {
          $trim: {
            input: {
              $concat: ['$surname', ' ', '$name', ' ', '$patronymic']
            }
          }
        },
        controlDates: [
          {
            title: 'Карта водителя',
            dbField: 'driverCardPeriod',
            validDays: {
              $dateDiff: {
                startDate: '$$NOW',
                endDate: '$driverCardPeriod',
                unit: 'day'
              }
            }
          },
          {
            title: 'Аттестация (мед.книжка)',
            dbField: 'medBook.certifiedBeforeDate',
            validDays: {
              $dateDiff: {
                startDate: '$$NOW',
                endDate: '$medBook.certifiedBeforeDate',
                unit: 'day'
              }
            }
          },
          {
            title: 'Ежегодная комиссия (мед.книжка)',
            dbField: 'medBook.annualCommisionDate',
            validDays: {
              $dateDiff: {
                startDate: '$medBook.annualCommisionDate',
                endDate: {
                  $dateAdd: {
                    startDate: '$$NOW',
                    unit: 'year',
                    amount: 1
                  }
                },
                unit: 'day'
              }
            }
          }
        ]
      }
    },
    {
      $unwind: '$controlDates'
    },
    {
      $match: {
        'controlDates.validDays': {
          $lte: dayLimit
        }
      }
    }
  ]

  const trucks = [
    {
      $unionWith: {
        coll: 'trucks',
        pipeline: [
          {
            $match: {
              company: Types.ObjectId(profile)
            }
          },
          {
            $project: {
              collection: 'trucks',
              name: '$regNum',
              controlDates: [
                {
                  title: 'Сан.паспорт',
                  dbField: 'sanitaryPassportExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$sanitaryPassportExpDate',
                      unit: 'day'
                    }
                  }
                },
                {
                  title: 'Дневной пропуск',
                  dbField: 'permits.dayPermitExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$permits.dayPermitExpDate',
                      unit: 'day'
                    }
                  }
                },
                {
                  title: 'Ночной пропуск',
                  dbField: 'permits.nightPermitExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$permits.nightPermitExpDate',
                      unit: 'day'
                    }
                  }
                },
                {
                  title: 'Осаго',
                  dbField: 'insurance.osagoExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$insurance.osagoExpDate',
                      unit: 'day'
                    }
                  }
                },
                {
                  title: 'Каско',
                  dbField: 'insurance.kaskoExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$insurance.kaskoExpDate',
                      unit: 'day'
                    }
                  }
                },
                {
                  title: 'Диагностическая карта',
                  dbField: 'additionalDetails.diagnosticCardExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$additionalDetails.diagnosticCardExpDate',
                      unit: 'day'
                    }
                  }
                },
                {
                  title: 'Тахограф',
                  dbField: 'additionalDetails.tachographExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$additionalDetails.tachographExpDate',
                      unit: 'day'
                    }
                  }
                }
              ]
            }
          },
          {
            $unwind: '$controlDates'
          },
          {
            $match: {
              'controlDates.validDays': {
                $lte: dayLimit
              }
            }
          }
        ]
      }
    }
  ]

  return [...drivers, ...trucks, { $sort: { 'controlDates.validDays': 1 } }]
}
