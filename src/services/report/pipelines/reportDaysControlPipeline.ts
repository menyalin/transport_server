import pkg, { PipelineStage } from 'mongoose'
const { Types } = pkg

export default (dayLimit = 30, profile: string, carriers?: string[]) => {
  const additionalNotifications = {
    $ifNull: [
      {
        $map: {
          input: '$additionalNotifications',
          as: 'item',
          in: {
            title: '$$item.title',
            daysBeforeRemind: '$$item.daysBeforeRemind',
            note: '$$item.note',
            endDate: '$$item.expDate',
            validDays: {
              $dateDiff: {
                startDate: '$$NOW',
                endDate: '$$item.expDate',
                unit: 'day',
              },
            },
          },
        },
      },
      [],
    ],
  }
  const concatArrays: PipelineStage.AddFields = {
    $addFields: {
      controlDates: {
        $concatArrays: ['$controlDates', '$additionalNotifications'],
      },
    },
  }
  const truckMatcher: PipelineStage.Match = {
    $match: {
      company: new Types.ObjectId(profile),
      endServiceDate: null,
      $expr: {
        $and: [],
      },
    },
  }

  const driverMatcher: PipelineStage.Match = {
    $match: {
      company: new Types.ObjectId(profile),
      dismissalDate: null,
      $expr: {
        $and: [],
      },
    },
  }

  if (carriers && carriers.length > 0) {
    truckMatcher.$match.$expr?.$and.push({
      $in: ['$tkName', carriers.map((i) => new Types.ObjectId(i))],
    })

    driverMatcher.$match.$expr?.$and.push({
      $in: ['$tkName', carriers.map((i) => new Types.ObjectId(i))],
    })
  }

  const drivers = [
    driverMatcher,
    {
      $project: {
        collection: 'drivers',
        tkName: '$tkName',
        name: {
          $trim: {
            input: {
              $concat: ['$surname', ' ', '$name', ' ', '$patronymic'],
            },
          },
        },
        additionalNotifications,
        controlDates: [
          {
            title: 'Карта водителя',
            dbField: 'driverCardPeriod',
            endDate: '$driverCardPeriod',
            validDays: {
              $dateDiff: {
                startDate: '$$NOW',
                endDate: '$driverCardPeriod',
                unit: 'day',
              },
            },
          },
          {
            title: 'Аттестация (мед.книжка)',
            dbField: 'medBook.certifiedBeforeDate',
            endDate: '$medBook.certifiedBeforeDate',
            validDays: {
              $dateDiff: {
                startDate: '$$NOW',
                endDate: '$medBook.certifiedBeforeDate',
                unit: 'day',
              },
            },
          },
          {
            title: 'Ежегодная комиссия (мед.книжка)',
            dbField: 'medBook.annualCommisionDate',
            endDate: {
              $dateAdd: {
                startDate: '$medBook.annualCommisionDate',
                unit: 'year',
                amount: 1,
              },
            },
            validDays: {
              $dateDiff: {
                startDate: '$$NOW',
                endDate: {
                  $dateAdd: {
                    startDate: '$medBook.annualCommisionDate',
                    unit: 'year',
                    amount: 1,
                  },
                },
                unit: 'day',
              },
            },
          },
        ],
        note: '$medBook.note',
      },
    },
    {
      ...concatArrays,
    },

    {
      $unwind: '$controlDates',
    },
    {
      $match: {
        'controlDates.validDays': {
          $lte: dayLimit,
        },
      },
    },
  ]

  if (carriers && carriers.length > 0)
    truckMatcher.$match.$expr?.$and.push({
      $in: ['$tkName', carriers.map((i) => new Types.ObjectId(i))],
    })

  const trucks = [
    {
      $unionWith: {
        coll: 'trucks',
        pipeline: [
          truckMatcher,
          {
            $project: {
              collection: 'trucks',
              tkName: '$tkName',
              name: '$regNum',
              note: '$note',
              additionalNotifications,
              controlDates: [
                {
                  title: 'Сан.паспорт',
                  dbField: 'sanitaryPassportExpDate',
                  endDate: '$sanitaryPassportExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$sanitaryPassportExpDate',
                      unit: 'day',
                    },
                  },
                },
                {
                  title: 'Дневной пропуск',
                  dbField: 'permits.dayPermitExpDate',
                  endDate: '$permits.dayPermitExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$permits.dayPermitExpDate',
                      unit: 'day',
                    },
                  },
                },
                {
                  title: 'Ночной пропуск',
                  dbField: 'permits.nightPermitExpDate',
                  endDate: '$permits.nightPermitExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$permits.nightPermitExpDate',
                      unit: 'day',
                    },
                  },
                },
                {
                  title: 'Осаго',
                  dbField: 'insurance.osagoExpDate',
                  endDate: '$insurance.osagoExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$insurance.osagoExpDate',
                      unit: 'day',
                    },
                  },
                },
                {
                  title: 'Каско',
                  dbField: 'insurance.kaskoExpDate',
                  endDate: '$insurance.kaskoExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$insurance.kaskoExpDate',
                      unit: 'day',
                    },
                  },
                },
                {
                  title: 'Платон',
                  dbField: 'additionalDetails.platonDate',
                  endDate: '$additionalDetails.platonDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$additionalDetails.platonDate',
                      unit: 'day',
                    },
                  },
                },
                {
                  title: 'Диагностическая карта',
                  dbField: 'additionalDetails.diagnosticCardExpDate',
                  endDate: '$additionalDetails.diagnosticCardExpDate',
                  note: '$additionalDetails.diagnosticCardNote',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$additionalDetails.diagnosticCardExpDate',
                      unit: 'day',
                    },
                  },
                },
                {
                  title: 'Тахограф',
                  dbField: 'additionalDetails.tachographExpDate',
                  endDate: '$additionalDetails.tachographExpDate',
                  validDays: {
                    $dateDiff: {
                      startDate: '$$NOW',
                      endDate: '$additionalDetails.tachographExpDate',
                      unit: 'day',
                    },
                  },
                },
              ],
            },
          },
          {
            ...concatArrays,
          },

          {
            $unwind: '$controlDates',
          },
          {
            $match: {
              'controlDates.validDays': {
                $lte: dayLimit,
              },
            },
          },
        ],
      },
    },
  ]

  return [...drivers, ...trucks, { $sort: { 'controlDates.validDays': 1 } }]
}
