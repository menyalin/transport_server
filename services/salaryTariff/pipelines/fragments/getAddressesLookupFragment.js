import { PARTNER_GROUPS } from '../../../../constants/partner.js'

export default () => [
  { $unwind: { path: '$route' } },
  {
    $lookup: {
      from: 'addresses',
      localField: 'route.address',
      foreignField: '_id',
      as: 'route._address',
    },
  },
  {
    $addFields: {
      route: {
        _address: { $first: '$route._address' },
      },
    },
  },
  {
    $lookup: {
      from: 'partners',
      localField: 'route._address.partner',
      foreignField: '_id',
      as: 'route._address._partner',
    },
  },
  {
    $addFields: {
      route: {
        _address: {
          _partner: { $first: '$route._address._partner' },
        },
      },
    },
  },
  {
    $group: {
      _id: '$_id',
      route: { $push: '$route' },
      item: { $first: '$$ROOT' },
    },
  },
  {
    $replaceWith: {
      $mergeObjects: ['$item', { route: '$route' }],
    },
  },
  {
    $addFields: {
      _loadingAddress: {
        $getField: {
          field: '_address',
          input: { $first: '$route' },
        },
      },
      _lastAddress: {
        $getField: {
          field: '_address',
          input: {
            $last: {
              $filter: {
                input: '$route',
                cond: { $ne: ['$$this.isReturn', true] },
              },
            },
          },
        },
      },
    },
  },
  {
    $addFields: {
      _loadingAddressId: '$_loadingAddress._id',
      _lastAddressId: '$_lastAddress._id',
      _consigneeType: getConsigneeType(),
    },
  },
]

const getConsigneeType = () => ({
  $switch: {
    branches: PARTNER_GROUPS.map((groupItem) => ({
      case: { $in: [groupItem.value, getPartnersGroup()] },
      then: groupItem,
    })),
    default: PARTNER_GROUPS[PARTNER_GROUPS.length - 1],
  },
})

const getPartnersGroup = () => ({
  $map: {
    input: '$route',
    in: '$$this._address._partner.group',
  },
})
