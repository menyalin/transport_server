// @ts-nocheck
import { PARTNER_GROUPS } from '../../../../constants/partner'
import { getRouteDuration } from './getRouteDuration'
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
      _routeDuration: getRouteDuration(),
      _consigneeType: getConsigneeType(),
      _coords: getDistancesArray(),
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

const getArrayOfCoordinates = () => ({
  $map: {
    input: {
      $filter: { input: '$route', cond: { $not: '$$this.isReturn' } },
    },
    in: '$$this._address.geo.coordinates',
  },
})

const getDistancesArray = () => ({
  $reduce: {
    input: getArrayOfCoordinates(),
    initialValue: [
      { coords: { $first: getArrayOfCoordinates() }, distance: 0 },
    ],
    in: {
      $concatArrays: [
        '$$value',
        [
          {
            coords: '$$this',
            distance: {
              $multiply: [6372795, { $atan2: [getY(), getX()] }],
            },
          },
        ],
      ],
    },
  },
})

const getLastItemCoords = () => ({
  $getField: { input: { $last: '$$value' }, field: 'coords' },
})

const long1 = () => ({
  $divide: [{ $multiply: [{ $first: getLastItemCoords() }, Math.PI] }, 180],
})
const lat1 = () => ({
  $divide: [{ $multiply: [{ $last: getLastItemCoords() }, Math.PI] }, 180],
})

const long2 = () => ({
  $divide: [{ $multiply: [{ $first: '$$this' }, Math.PI] }, 180],
})
const lat2 = () => ({
  $divide: [{ $multiply: [{ $last: '$$this' }, Math.PI] }, 180],
})

const getX = () => ({
  $add: [
    { $multiply: [{ $sin: lat1() }, { $sin: lat2() }] },
    {
      $multiply: [
        { $cos: lat1() },
        { $cos: lat2() },
        { $cos: { $subtract: [long2(), long1()] } },
      ],
    },
  ],
})

const getY = () => ({
  $sqrt: {
    $add: [
      {
        $pow: [
          {
            $multiply: [
              { $cos: lat2() },
              { $sin: { $subtract: [long2(), long1()] } },
            ],
          },
          2,
        ],
      },
      {
        $pow: [
          {
            $subtract: [
              { $multiply: [{ $cos: lat1() }, { $sin: lat2() }] },
              {
                $multiply: [
                  { $sin: lat1() },
                  { $cos: lat2() },
                  { $cos: { $subtract: [long2(), long1()] } },
                ],
              },
            ],
          },
          2,
        ],
      },
    ],
  },
})

/*

coords	[ 37.673771, 55.325733 ]


const _distBetweenPoints = (a, b) => {
  const RAD = 6372795 // радиус земли
  const lat1 = (a[1] * Math.PI) / 180
  const lat2 = (b[1] * Math.PI) / 180
  const long1 = (a[0] * Math.PI) / 180
  const long2 = (b[0] * Math.PI) / 180

  const cl1 = Math.cos(lat1)
  const cl2 = Math.cos(lat2)
  const sl1 = Math.sin(lat1)
  const sl2 = Math.sin(lat2)
  const delta = long2 - long1
  const cdelta = Math.cos(delta)
  const sdelta = Math.sin(delta)

  const y = Math.sqrt(
    Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2)
  )
  const x = sl1 * sl2 + cl1 * cl2 * cdelta
  const ad = Math.atan2(y, x)
  return ad * RAD


  */
