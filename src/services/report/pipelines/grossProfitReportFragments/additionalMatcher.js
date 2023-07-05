import mongoose from 'mongoose'
const { Types, isObjectIdOrHexString } = mongoose

const getValuesArray = (values) =>
  values
    .map((i) => {
      if (isObjectIdOrHexString(i)) return Types.ObjectId(i)
      return i
    })
    .filter((i) => !!i)

const _getMainFilterBlock = ({ field, cond, values }) => {
  if (cond === 'in') return { $in: [field, getValuesArray(values)] }
  else return { $not: { $in: [field, getValuesArray(values)] } }
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
