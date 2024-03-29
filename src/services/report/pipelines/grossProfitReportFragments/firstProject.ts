// @ts-nocheck
import { firstPlannedDate } from '../fragments/firstPlannedDate'
import { POINT_TYPE_VALUES } from '../../../../constants/enums'

const getPointAddressIdsByType = (type) => {
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

const getOutsourceCosts = (withVat) => ({
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
    loadingAddressIds: getPointAddressIdsByType('loading'),
    unloadingAddressIds: getPointAddressIdsByType('unloading'),
    capacityType: '$reqTransport.liftCapacity',
    tRegime: '$cargoParams.tRegime',
    truckKind: '$reqTransport.kind',
    truckId: '$confirmedCrew.truck',
    tkName: '$confirmedCrew.tkName',
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
