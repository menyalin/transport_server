import { PipelineStage, Types } from 'mongoose'

export const orderLoadingZoneFragmentBuilder = (
  zones: string[] = []
): PipelineStage[] => {
  const firstLoadingPoint = {
    $first: {
      $filter: {
        input: '$route',
        cond: { $eq: ['$$this.type', 'loading'] },
      },
    },
  }
  let zonesFilterFragment: PipelineStage[] = []
  if (zones && zones.length) {
    zonesFilterFragment.push({
      $match: {
        $expr: {
          $or: zones.map((i) => ({
            $in: [new Types.ObjectId(i), '$_loadingZoneIds'],
          })),
        },
      },
    })
  }

  const mainLoadingPoint = {
    $first: {
      $filter: {
        input: '$route',
        cond: { $eq: ['$$this.isMainLoadingPoint', true] },
      },
    },
  }

  return [
    {
      $addFields: {
        _loadingAddress: {
          $getField: {
            field: 'address',
            input: { $ifNull: [mainLoadingPoint, firstLoadingPoint] },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'addresses',
        localField: '_loadingAddress',
        foreignField: '_id',
        as: '_loadingAddress',
      },
    },
    {
      $addFields: {
        _loadingAddress: { $first: '$_loadingAddress' },
        _loadingZoneIds: {
          $getField: {
            field: 'zones',
            input: { $first: '$_loadingAddress' },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'zones',
        localField: '_loadingZoneIds',
        foreignField: '_id',
        as: '_loadingZones',
      },
    },
    {
      $addFields: {
        loadingZoneNames: {
          $map: { input: '$_loadingZones', as: 'zone', in: '$$zone.name' },
        },
      },
    },
    ...zonesFilterFragment,
  ]
}
