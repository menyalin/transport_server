import { PipelineStage, Types, isObjectIdOrHexString } from 'mongoose'

export const getFullOrderDataPipeline = (
  orderId: string | Types.ObjectId
): PipelineStage[] => {
  const companyLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'companyName',
      },
    },
    {
      $addFields: {
        companyName: {
          $getField: {
            field: 'fullName',
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

  return [
    {
      $match: {
        _id: new Types.ObjectId(orderId),
      },
    },
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
    ...companyLookup,
    ...driverLookup,
    ...truckLookup,
    ...trailerLookup,
    ...addressLookup,
  ]
}
