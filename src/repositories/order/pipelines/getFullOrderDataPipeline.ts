import { PipelineStage, Types } from 'mongoose'

export const getFullOrderDataPipeline = (
  orderId: string | Types.ObjectId
): PipelineStage[] => {
  const agreementLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'client.agreement',
        foreignField: '_id',
        as: 'companyName',
      },
    },
    {
      $addFields: {
        companyName: {
          $getField: {
            field: 'executorName',
            input: { $first: '$companyName' },
          },
        },
      },
    },
  ]
  const driverLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'drivers',
        localField: 'confirmedCrew.driver',
        foreignField: '_id',
        as: 'driver',
      },
    },
    {
      $addFields: {
        driver: { $first: '$driver' },
      },
    },
  ]
  const truckLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'trucks',
        localField: 'confirmedCrew.truck',
        foreignField: '_id',
        as: 'truck',
      },
    },
    {
      $addFields: {
        truck: { $first: '$truck' },
      },
    },
  ]
  const trailerLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'trucks',
        localField: 'confirmedCrew.trailer',
        foreignField: '_id',
        as: 'trailer',
      },
    },
    {
      $addFields: {
        trailer: { $first: '$trailer' },
      },
    },
  ]
  const addressLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'addresses',
        localField: 'route.address',
        foreignField: '_id',
        as: 'addresses',
      },
    },
  ]
  const getAddressIdsByTypeFragment = (type: string) => ({
    $map: {
      input: {
        $filter: {
          input: '$route',
          as: 'point',
          cond: { $eq: ['$$point.type', type] },
        },
      },
      in: '$$this.address',
    },
  })

  const addressesByTypeLookup: PipelineStage[] = [
    {
      $addFields: {
        loadingAddressIds: getAddressIdsByTypeFragment('loading'),
        unloadingAddressIds: getAddressIdsByTypeFragment('unloading'),
      },
    },
    {
      $lookup: {
        from: 'addresses',
        localField: 'loadingAddressIds',
        foreignField: '_id',
        as: 'loadingAddresses',
      },
    },
    {
      $lookup: {
        from: 'addresses',
        localField: 'unloadingAddressIds',
        foreignField: '_id',
        as: 'unloadingAddresses',
      },
    },
  ]

  return [
    { $match: { _id: new Types.ObjectId(orderId) } },
    {
      $addFields: {
        plannedDate: {
          $getField: {
            input: { $first: '$route' },
            field: 'plannedDate',
          },
        },
        orderNum: '$client.num',
      },
    },
    ...agreementLookup,
    ...driverLookup,
    ...truckLookup,
    ...trailerLookup,
    ...addressesByTypeLookup,
    ...addressLookup,
  ]
}
