export const getAddressDetails = () => [
  {
    $addFields: {
      _loadingAddressIds: {
        $map: {
          input: {
            $filter: {
              input: '$route',
              cond: { $eq: ['$$this.type', 'loading'] },
            },
          },
          in: '$$this.address',
        },
      },
      _unloadingAddressIds: {
        $map: {
          input: {
            $filter: {
              input: '$route',
              cond: { $eq: ['$$this.type', 'unloading'] },
            },
          },
          in: '$$this.address',
        },
      },
    },
  },
  {
    $lookup: {
      from: 'addresses',
      localField: '_loadingAddressIds',
      foreignField: '_id',
      as: '_loadingAddresses',
    },
  },
  {
    $lookup: {
      from: 'addresses',
      localField: '_unloadingAddressIds',
      foreignField: '_id',
      as: '_unloadingAddresses',
    },
  },
  {
    $addFields: {
      loadingPoints: {
        $trim: {
          input: {
            $reduce: {
              input: '$_loadingAddresses',
              initialValue: '',
              in: { $concat: ['$$value', '$$this.shortName', ', '] },
            },
          },
          chars: ', ',
        },
      },
      unloadingPoints: {
        $trim: {
          input: {
            $reduce: {
              input: '$_unloadingAddresses',
              initialValue: '',
              in: { $concat: ['$$value', '$$this.shortName', ', '] },
            },
          },
          chars: ', ',
        },
      },
    },
  },
]
