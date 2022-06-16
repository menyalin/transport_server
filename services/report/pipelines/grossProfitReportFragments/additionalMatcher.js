import mongoose from 'mongoose'
const { Types, isObjectIdOrHexString } = mongoose

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

export const additionalMatcher = (filters) => {
  const matcher = { $match: { $expr: { $and: [] } } }

  // Основной отбор по КЛИЕНТАМ
  if (filters.clients?.values.length)
    matcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$client',
        cond: filters.clients.cond,
        values: filters.clients.values,
      }),
    )

  // Основной отбор по TkNames
  if (filters.tkNames?.values.length)
    matcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$tkName',
        cond: filters.tkNames.cond,
        values: filters.tkNames.values,
      }),
    )

  // Основной отбор по грузовикам
  if (filters.trucks?.values.length)
    matcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$truckId',
        cond: filters.trucks.cond,
        values: filters.trucks.values,
      }),
    )

  // Основной отбор по водителям
  if (filters.drivers?.values.length)
    matcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$driverId',
        cond: filters.drivers.cond,
        values: filters.drivers.values,
      }),
    )

  // Основной отбор по типу рейса
  if (filters.orderTypes?.values.length)
    matcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$orderType',
        cond: filters.orderTypes.cond,
        values: filters.orderTypes.values,
      }),
    )

  return matcher
}
