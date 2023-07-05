import mongoose from 'mongoose'
const { Types, isObjectIdOrHexString } = mongoose

const getValuesArray = (values) =>
  values.map((i) => (isObjectIdOrHexString(i) ? Types.ObjectId(i) : i))

const _getMainFilterBlock = ({ field, cond, values }) => {
  if (cond === 'in')
    return {
      $in: [field, getValuesArray(values)],
    }
  else
    return {
      $not: { $in: [field, getValuesArray(values)] },
    }
}

export const firstMatcher = ({ company, dateRange, mainFilters }) => {
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

  // Основной отбор по типу рейса
  if (mainFilters.orderTypes?.values.length)
    firstMatcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$analytics.type',
        cond: mainFilters.orderTypes.cond,
        values: mainFilters.orderTypes.values,
      }),
    )
  return firstMatcher
}
