import { PipelineStage } from 'mongoose'
import { SALARY_TARIFF_TYPES } from '@/constants/accounting'
import { ORDER_ANALYTIC_TYPES } from '@/constants/order'
const getAddressShortName = (pointType: string) => ({
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

const getTariffTypeStr = (tariffTypeFieldPath: string) => ({
  $switch: {
    branches: SALARY_TARIFF_TYPES.map((type) => ({
      case: { $eq: [tariffTypeFieldPath, type.value] },
      then: type.text,
    })),
    default: '',
  },
})

export default (): PipelineStage[] => {
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
        _clientName: {
          $getField: {
            input: { $first: '$_client' },
            field: 'name',
          },
        },
        _driverFullName: '$_driverFullName',
        _loadingAddressesStr: getAddressShortName('loading'),
        _unloadingAddressesStr: getAddressShortName('unloading'),
        _truckRegNum: '$_truck.regNum',
        _trailerRegNum: '$_trailer.regNum',
        _baseTariffTypeStr: getTariffTypeStr('$_baseTariff._id'),
        orderTypeStr: {
          $switch: {
            branches: ORDER_ANALYTIC_TYPES.map((item) => ({
              case: { $eq: [item.value, '$analytics.type'] },
              then: item.text,
            })),
            default: '__error__',
          },
        },
        route: '$route',
        docsState: '$docsState.getted',
        truckId: '$_truck._id',
        baseTariff: '$_baseTariff',
        waitingTariff: '$_waitingTariff',
        _consigneeType: '$_consigneeType',

        base: '$_baseTariff.tariff.sum',
        payment: { $ifNull: ['$paymentToDriver.sum', 0] },
        waiting: '$_waitingSum',
        returnSum: '$_returnSum',
        additionalPointsSum: '$_additionalPointsSum',
        duration: '$_routeDuration',

        // _waitingInMinutes: '$_waitingInMinutes',
        // _unloadingDurationsMinutes: '$_unloadingDurationsMinutes',
        // _roundedMinutes: '$_roundedMinutes',
        grade: '$grade',
        // _clientAgreemenent: '$_clientAgreement',
        _executorName: '$_clientAgreement.executorName',
      },
    },

    {
      $addFields: {
        totalSum: {
          $add: [
            { $ifNull: ['$base', 0] },
            { $ifNull: ['$waiting', 0] },
            { $ifNull: ['$payment', 0] },
            { $ifNull: ['$returnSum', 0] },
            { $ifNull: ['$additionalPointsSum', 0] },
          ],
        },
      },
    },
    {
      $sort: { orderDate: 1 },
    },
  ]
}
