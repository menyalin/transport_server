import mongoose from 'mongoose'
import { POINT_TYPE_VALUES, POINT_TYPES_ENUM } from '../../../constants/enums'
import {
  ORDER_PRICE_TYPES_ENUM_VALUES,
  ORDER_PRICE_TYPES_ENUM,
} from '../../../constants/priceTypes'

const getPointAddressIdsByType = (type: string) => {
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

const addPriceObjByTypes = (priceTypes: string[]) => {
  let prices = {}
  priceTypes.forEach((type) => {
    prices = Object.assign(prices, {
      [type]: {
        $arrayToObject: {
          $map: {
            input: `$${type}`,
            in: { k: '$$this.type', v: '$$this' },
          },
        },
      },
    })
  })
  return {
    $addFields: { ...prices },
  }
}

const addPriceTypeFieldsBuilder = (priceTypes: string[]) => {
  let res = {}
  priceTypes.forEach((type) => {
    res = Object.assign(res, {
      [type]: {
        $ifNull: [
          '$finalPrices.' + type,
          '$prices.' + type,
          '$prePrices.' + type,
        ],
      },
    })
  })
  return { $addFields: { ...res } }
}

const getTotalPrice = (priceTypes: string[], withVat = true) => ({
  $add: priceTypes.map((type) => ({
    $ifNull: [`$${type}.${withVat ? 'price' : 'priceWOVat'}`, 0],
  })),
})

const addTotalPriceFields = () => ({
  $addFields: {
    totalWithVat: getTotalPrice(ORDER_PRICE_TYPES_ENUM_VALUES, true),
    totalWOVat: getTotalPrice(ORDER_PRICE_TYPES_ENUM_VALUES, false),
  },
})

export default ({
  dateRange,
  company,
}: {
  dateRange: string[]
  company: string
}) => {
  const firstMatcher = {
    $match: {
      company: new mongoose.Types.ObjectId(company),
      isActive: true,
      $expr: {
        $and: [
          { $in: ['$state.status', ['completed', 'getted', 'inProgress']] },
          { $gte: ['$startPositionDate', new Date(dateRange[0])] },
          { $lt: ['$startPositionDate', new Date(dateRange[1])] },
        ],
      },
    },
  }

  const project = {
    $project: {
      client: '$client.client',
      loadingAddressIds: getPointAddressIdsByType('loading'),
      unloadingAddressIds: getPointAddressIdsByType('unloading'),
      truckId: '$confirmedCrew.truck',
      driverId: '$confirmedCrew.driver',
      clientId: '$client.client',
      prices: '$prices',
      prePrices: '$prePrices',
      finalPrices: '$finalPrices',
    },
  }

  const sortOrdersByTotalPrice = {
    $sort: { totalWithVat: -1 },
  }

  const group = {
    $group: {
      _id: '$client',
      orders: { $push: '$$ROOT' },
      totalCount: { $count: {} },
      totalWithVat: { $sum: '$totalWithVat' },
      totalWOVat: { $sum: '$totalWOVat' },
    },
  }
  const sortClientsByTotalPrice = {
    $sort: { totalWithVat: -1 },
  }

  const finalGroup = {
    $group: {
      _id: 'orders',
      clients: { $push: '$$ROOT' },
      totalCount: { $sum: '$totalCount' },
      totalWithVat: { $sum: '$totalWithVat' },
      totalWOVat: { $sum: '$totalWOVat' },
    },
  }

  return [
    firstMatcher,
    addPriceObjByTypes(['prices', 'prePrices', 'finalPrices']),
    project,
    addPriceTypeFieldsBuilder(ORDER_PRICE_TYPES_ENUM_VALUES),
    addTotalPriceFields(),
    sortOrdersByTotalPrice,
    group,
    sortClientsByTotalPrice,
    finalGroup,
  ]
}
