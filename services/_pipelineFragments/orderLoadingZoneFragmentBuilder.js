export const orderLoadingZoneFragmentBuilder = () => {
  return [
    {
      $addFields: {
        _loadingAddress: {
          $getField: {
            field: 'address',
            input: { $first: '$route' },
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
  ]
}
