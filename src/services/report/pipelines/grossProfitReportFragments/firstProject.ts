import { firstPlannedDate } from '../fragments/firstPlannedDate'
import { POINT_TYPE_VALUES, POINT_TYPES_ENUM } from '@/constants/enums'

const getPointAddressIdsByType = (type: POINT_TYPES_ENUM) => {
  if (!type || !POINT_TYPE_VALUES.includes(type))
    throw new Error(`GROSS PROFIT ERROR: incorrect point type: ${type}`)
  return {
    $map: {
      input: {
        $filter: {
          input: '$route',
          cond: { $eq: ['$$this.type', type] },
        },
      },
      in: '$$this.address',
    },
  }
}

const getOutsourceCosts = (withVat: Boolean) => ({
  $reduce: {
    input: '$outsourceCosts',
    initialValue: 0,
    in: { $add: ['$$value', withVat ? '$$this.price' : '$$this.priceWOVat'] },
  },
})

export const firstProject = () => ({
  $project: {
    status: '$state.status',
    agreement: '$client.agreement',
    client: '$client.client',
    orderDate: firstPlannedDate(),
    orderType: '$analytics.type',
    loadingAddressIds: getPointAddressIdsByType(POINT_TYPES_ENUM.loading),
    unloadingAddressIds: getPointAddressIdsByType(POINT_TYPES_ENUM.unloading),
    capacityType: '$reqTransport.liftCapacity',
    tRegime: '$cargoParams.tRegime',
    truckKind: '$reqTransport.kind',
    truckId: '$confirmedCrew.truck',
    carrierId: '$confirmedCrew.tkName',
    driverId: '$confirmedCrew.driver',
    clientId: '$client.client',
    outsourceCostsWithVat: getOutsourceCosts(true),
    outsourceCostsWOVat: getOutsourceCosts(false),
    prices: '$prices',
    prePrices: '$prePrices',
    finalPrices: '$finalPrices',
    note: '$note',
  },
})
