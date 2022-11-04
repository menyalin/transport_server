import { SALARY_TARIFF_TYPES } from '../../../../constants/accounting.js'

const getAddressShortName = (pointType) => ({
  $trim: {
    chars: ', ',
    input: {
      $reduce: {
        input: {
          $filter: {
            input: '$route',
            cond: { $eq: ['$$this.type', pointType] },
          },
        },
        initialValue: '',
        in: { $concat: ['$$value', '$$this._address.shortName', ', '] },
      },
    },
  },
})

const getTariffTypeStr = (tariffTypeFieldPath) => ({
  $switch: {
    branches: SALARY_TARIFF_TYPES.map((type) => ({
      case: { $eq: [tariffTypeFieldPath, type.value] },
      then: type.text,
    })),
    default: '',
  },
})

const getRouteDuration = () => ({
  $dateDiff: {
    startDate: {
      $ifNull: [
        { $getField: { field: 'arrivalDateDoc', input: { $first: '$route' } } },
        { $getField: { field: 'arrivalDate', input: { $first: '$route' } } },
      ],
    },
    endDate: {
      $ifNull: [
        {
          $getField: { field: 'departureDateDoc', input: { $last: '$route' } },
        },
        {
          $getField: { field: 'departureDate', input: { $last: '$route' } },
        },
      ],
    },
    unit: 'hour',
  },
})

export default () => {
  return [
    {
      $lookup: {
        from: 'partners',
        localField: 'client.client',
        foreignField: '_id',
        as: '_client',
      },
    },
    {
      $project: {
        orderDate: '$_orderPeriodDate',
        _client: { $first: '$_client' },
        _loadingAddressesStr: getAddressShortName('loading'),
        _unloadingAddressesStr: getAddressShortName('unloading'),
        _truckRegNum: '$_truck.regNum',
        _trailerRegNum: '$_trailer.regNum',
        _baseTariffTypeStr: getTariffTypeStr('$_baseTariff._id'),
        _paymentSum: '$paymentToDriver.sum',
        _routeDuration: getRouteDuration(),
        route: '$route',
        docsState: '$docsState.getted',
        truckId: '$_truck._id',
        baseTariff: '$_baseTariff',
        waitingTariff: '$_waitingTariff',
        waitingSum: '$_waitingSum',
        _waitingInMinutes: '$_waitingInMinutes',
        _unloadingDurationsMinutes: '$_unloadingDurationsMinutes',
        _roundedMinutes: '$_roundedMinutes',
        grade: '$grade',
        _clientAgreemenent: '$_clientAgreement',
        _consigneeType: '$_consigneeType',
      },
    },
    {
      $addFields: {
        totalSum: {
          $add: [
            '$baseTariff.tariff.sum',
            { $ifNull: ['$waitingSum', 0] },
            { $ifNull: ['$_paymentSum', 0] },
          ],
        },
      },
    },
    {
      $sort: { orderDate: 1 },
    },
  ]
}
