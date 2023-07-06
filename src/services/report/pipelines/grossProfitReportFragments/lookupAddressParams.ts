// @ts-nocheck
export const lookupAddressParams = () => [
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
  {
    $addFields: {
      loadingRegions: {
        $map: {
          input: '$loadingAddresses',
          in: '$$this.region',
        },
      },
      unloadingRegions: {
        $map: {
          input: '$unloadingAddresses',
          in: '$$this.region',
        },
      },
      loadingCities: {
        $map: {
          input: '$loadingAddresses',
          in: '$$this.city',
        },
      },
      unloadingCities: {
        $map: {
          input: '$unloadingAddresses',
          in: '$$this.city',
        },
      },
      loadingZones: {
        $reduce: {
          input: '$loadingAddresses',
          initialValue: [],
          in: { $concatArrays: ['$$value', '$$this.zones'] },
        },
      },
      unloadingZones: {
        $reduce: {
          input: '$unloadingAddresses',
          initialValue: [],
          in: { $concatArrays: ['$$value', '$$this.zones'] },
        },
      },
    },
  },
]
