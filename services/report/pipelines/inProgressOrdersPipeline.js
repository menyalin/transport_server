import pkg from 'mongoose'
const { Types } = pkg

export default ({ profile, client }) => {
  const currentMoment = new Date()

  const pointInProgress = {
    arrivalDate: {
      $ne: null,
    },
    $or: [
      { departureDate: { $eq: null } },
      { departureDate: { $gte: currentMoment } },
    ],
  }

  const matcher = {
    $match: {
      isActive: true,
      company: Types.ObjectId(profile),
      route: {
        $elemMatch: pointInProgress,
      },
    },
  }

  const unwindRoute = {
    $unwind: '$route',
  }

  const lookupAddresses = [
    {
      $lookup: {
        from: 'addresses',
        localField: 'route.address',
        foreignField: '_id',
        as: 'route.addressObj',
      },
    },
    {
      $addFields: {
        'route.addressObj': {
          $first: '$route.addressObj',
        },
      },
    },
  ]

  const groupRoute = {
    $group: {
      _id: '$_id',
      route: {
        $push: '$route',
      },
      client: {
        $first: '$client',
      },
      confirmedCrew: {
        $first: '$confirmedCrew',
      },
    },
  }

  const lookupClient = {
    $lookup: {
      from: 'partners',
      localField: 'client.client',
      foreignField: '_id',
      as: 'client.client',
    },
  }

  const lookupDriver = {
    $lookup: {
      from: 'drivers',
      localField: 'confirmedCrew.driver',
      foreignField: '_id',
      as: 'driver',
    },
  }

  const lookupTruck = {
    $lookup: {
      from: 'trucks',
      localField: 'confirmedCrew.truck',
      foreignField: '_id',
      as: 'truck',
    },
  }
  const lookupTrailer = {
    $lookup: {
      from: 'trucks',
      localField: 'confirmedCrew.trailer',
      foreignField: '_id',
      as: 'trailer',
    },
  }

  const finalProject = {
    $project: {
      clientId: {
        $getField: {
          field: '_id',
          input: {
            $first: '$client.client',
          },
        },
      },
      clientName: {
        $getField: {
          field: 'name',
          input: {
            $first: '$client.client',
          },
        },
      },
      driverId: {
        $getField: {
          field: '_id',
          input: {
            $first: '$driver',
          },
        },
      },

      driverPhone: {
        $getField: {
          field: 'phone',
          input: {
            $first: '$driver',
          },
        },
      },
      driverPhone2: {
        $getField: {
          field: 'phone2',
          input: {
            $first: '$driver',
          },
        },
      },
      driverName: {
        $trim: {
          input: {
            $concat: [
              {
                $getField: {
                  field: 'surname',
                  input: {
                    $first: '$driver',
                  },
                },
              },
              ' ',
              {
                $getField: {
                  field: 'name',
                  input: {
                    $first: '$driver',
                  },
                },
              },
              ' ',
              {
                $getField: {
                  field: 'patronymic',
                  input: {
                    $first: '$driver',
                  },
                },
              },
              ' ',
            ],
          },
        },
      },
      plannedDate: {
        $getField: {
          field: 'plannedDate',
          input: {
            $first: '$route',
          },
        },
      },
      loadingPoints: {
        $map: {
          input: {
            $filter: {
              input: '$route',
              cond: {
                $eq: ['$$this.type', 'loading'],
              },
            },
          },
          in: '$$this.addressObj.shortName',
        },
      },
      unloadingPoints: {
        $map: {
          input: {
            $filter: {
              input: '$route',
              cond: {
                $eq: ['$$this.type', 'unloading'],
              },
            },
          },
          in: '$$this.addressObj.shortName',
        },
      },
      truckId: {
        $getField: {
          field: '_id',
          input: {
            $first: '$truck',
          },
        },
      },

      truckNum: {
        $getField: {
          field: 'regNum',
          input: {
            $first: '$truck',
          },
        },
      },
      trailerId: {
        $getField: {
          field: '_id',
          input: {
            $first: '$trailer',
          },
        },
      },
      trailerNum: {
        $getField: {
          field: 'regNum',
          input: {
            $first: '$trailer',
          },
        },
      },
      state: {
        $getField: {
          field: 'type',
          input: {
            $first: {
              $filter: {
                input: '$route',
                cond: {
                  $and: [
                    { $ne: ['$$this.arrivalDate', null] },
                    {
                      $or: [
                        {
                          $eq: [
                            { $ifNull: ['$$this.departureDate', null] },
                            null,
                          ],
                        },
                        { $gte: ['$$this.departureDate', currentMoment] },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },

      currentPoint: {
        $getField: {
          field: 'addressObj',
          input: {
            $first: {
              $filter: {
                input: '$route',
                cond: {
                  $and: [
                    { $ne: ['$$this.arrivalDate', null] },
                    {
                      $or: [
                        {
                          $eq: [
                            { $ifNull: ['$$this.departureDate', null] },
                            null,
                          ],
                        },
                        { $gte: ['$$this.departureDate', currentMoment] },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  }

  if (client) matcher.$match.client.client = Types.ObjectId(client)
  return [
    matcher,
    unwindRoute,
    ...lookupAddresses,
    groupRoute,
    lookupClient,
    lookupDriver,
    lookupTruck,
    lookupTrailer,
    finalProject,
    {
      $sort: {
        plannedDate: 1,
      },
    },
  ]
}
