// @ts-nocheck
import mongoose from 'mongoose'
import { POINT_TYPES } from '../../../constants/enums'
import { ORDER_PRICE_TYPES_ENUM } from '../../../constants/priceTypes'

const getPointAddressIdsByType = (type) => {
  if (!type || !POINT_TYPES.includes(type))
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

const addPriceObjByTypes = (priceTypes) => {
  const prices = {}
  priceTypes.forEach((type) => {
    prices[type] = {
      $arrayToObject: {
        $map: {
          input: `$${type}`,
          in: { k: '$$this.type', v: '$$this' },
        },
      },
    }
  })
  return {
    $addFields: { ...prices },
  }
}

const addPriceTypeFieldsBuilder = (priceTypes) => {
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

const getTotalPrice = (priceTypes, withVat = true) => ({
  $add: priceTypes.map((type) => ({
    $ifNull: [`$${type}.${withVat ? 'price' : 'priceWOVat'}`, 0],
  })),
})

const addTotalPriceFields = () => ({
  $addFields: {
    totalWithVat: getTotalPrice(ORDER_PRICE_TYPES_ENUM, true),
    totalWOVat: getTotalPrice(ORDER_PRICE_TYPES_ENUM, false),
  },
})

export default ({ dateRange, company }) => {
  const firstMatcher = {
    $match: {
      company: mongoose.Types.ObjectId(company),
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
    addPriceTypeFieldsBuilder(ORDER_PRICE_TYPES_ENUM),
    addTotalPriceFields(),
    sortOrdersByTotalPrice,
    group,
    sortClientsByTotalPrice,
    finalGroup,
  ]
}
