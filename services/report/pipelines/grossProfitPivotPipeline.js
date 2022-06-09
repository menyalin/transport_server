import mongoose from 'mongoose'
import { POINT_TYPES } from '../../../constants/enums.js'
import { ORDER_PRICE_TYPES_ENUM } from '../../../constants/priceTypes.js'
const { Types, isObjectIdOrHexString } = mongoose

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

const _getMainFilterBlock = ({ field, cond, values }) => {
  if (cond === 'in')
    return {
      $in: [
        field,
        values.map((i) => (isObjectIdOrHexString(i) ? Types.ObjectId(i) : i)),
      ],
    }
  else
    return {
      $not: {
        $in: [
          field,
          values.map((i) => (isObjectIdOrHexString(i) ? Types.ObjectId(i) : i)),
        ],
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

export default ({ dateRange, company, groupBy, mainFilters }) => {
  const firstMatcher = {
    $match: {
      company: Types.ObjectId(company),
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
  // Основной отбор по КЛИЕНТАМ
  if (mainFilters.clients?.values.length)
    firstMatcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$client.client',
        cond: mainFilters.clients.cond,
        values: mainFilters.clients.values,
      }),
    )

  // Основной отбор по TkNames
  if (mainFilters.tkNames?.values.length)
    firstMatcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$confirmedCrew.tkName',
        cond: mainFilters.tkNames.cond,
        values: mainFilters.tkNames.values,
      }),
    )

  // Основной отбор по грузовикам
  if (mainFilters.trucks?.values.length)
    firstMatcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$confirmedCrew.truck',
        cond: mainFilters.trucks.cond,
        values: mainFilters.trucks.values,
      }),
    )

  // Основной отбор по водителям
  if (mainFilters.drivers?.values.length)
    firstMatcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$confirmedCrew.driver',
        cond: mainFilters.drivers.cond,
        values: mainFilters.drivers.values,
      }),
    )

  if (mainFilters.orderTypes?.values.length)
    firstMatcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$analytics.type',
        cond: mainFilters.orderTypes.cond,
        values: mainFilters.orderTypes.values,
      }),
    )

  const project = {
    $project: {
      client: '$client.client',
      orderType: '$analytics.type',
      loadingAddressIds: getPointAddressIdsByType('loading'),
      unloadingAddressIds: getPointAddressIdsByType('unloading'),
      truckId: '$confirmedCrew.truck',
      tkName: '$confirmedCrew.tkName',
      driverId: '$confirmedCrew.driver',
      clientId: '$client.client',
      prices: '$prices',
      prePrices: '$prePrices',
      finalPrices: '$finalPrices',
    },
  }

  const group = (groupBy) => {
    let groupType
    switch (groupBy) {
      case 'client':
        groupType = '$client'
        break
      case 'orderType':
        groupType = '$orderType'
        break
      case 'truck':
        groupType = '$truckId'
        break
      case 'driver':
        groupType = '$driverId'
        break
      case 'tkName':
        groupType = '$tkName'
        break
    }

    return {
      $group: {
        _id: groupType,
        orders: { $push: '$$ROOT' },
        totalCount: { $count: {} },
        totalWithVat: { $sum: '$totalWithVat' },
        totalWOVat: { $sum: '$totalWOVat' },
        avgWithVat: { $avg: '$totalWithVat' },
      },
    }
  }

  const finalGroup = {
    $group: {
      _id: groupBy,
      items: { $push: '$$ROOT' },
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
    { $sort: { totalWithVat: -1 } },
    group(groupBy),
    { $sort: { totalWithVat: -1 } },
    finalGroup,
  ]
}
