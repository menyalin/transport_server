import mongoose, { PipelineStage } from 'mongoose'
import { FilterValue, FilterCondition, FirstMatcherParams } from '../interfaces'
const { Types, isObjectIdOrHexString } = mongoose

const getValuesArray = (values: FilterValue[]) =>
  values.map((i) => (isObjectIdOrHexString(i) ? new Types.ObjectId(i) : i))

type MainFilterBlockParams = {
  field: string
  cond: FilterCondition
  values: FilterValue[]
}

const _getMainFilterBlock = ({
  field,
  cond,
  values,
}: MainFilterBlockParams):
  | { $in: [string, unknown[]] }
  | { $not: { $in: [string, unknown[]] } } => {
  if (cond === 'in')
    return {
      $in: [field, getValuesArray(values)],
    }
  else
    return {
      $not: { $in: [field, getValuesArray(values)] },
    }
}

export const firstMatcher = ({
  company,
  dateRange,
  mainFilters,
}: FirstMatcherParams): PipelineStage => {
  const firstMatcher: {
    $match: {
      company: mongoose.Types.ObjectId
      isActive: boolean
      $expr: {
        $and: any[]
      }
    }
  } = {
    $match: {
      company: new Types.ObjectId(company),
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

  if (mainFilters.clients?.values.length)
    firstMatcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$client.client',
        cond: mainFilters.clients.cond,
        values: mainFilters.clients.values,
      })
    )

  if (mainFilters.agreements?.values.length)
    firstMatcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$client.agreement',
        cond: mainFilters.agreements.cond,
        values: mainFilters.agreements.values,
      })
    )

  if (mainFilters.carriers?.values.length)
    firstMatcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$confirmedCrew.tkName',
        cond: mainFilters.carriers.cond,
        values: mainFilters.carriers.values,
      })
    )

  if (mainFilters.trucks?.values.length)
    firstMatcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$confirmedCrew.truck',
        cond: mainFilters.trucks.cond,
        values: mainFilters.trucks.values,
      })
    )

  if (mainFilters.drivers?.values.length)
    firstMatcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$confirmedCrew.driver',
        cond: mainFilters.drivers.cond,
        values: mainFilters.drivers.values,
      })
    )

  if (mainFilters.orderTypes?.values.length)
    firstMatcher.$match.$expr.$and.push(
      _getMainFilterBlock({
        field: '$analytics.type',
        cond: mainFilters.orderTypes.cond,
        values: mainFilters.orderTypes.values,
      })
    )
  return firstMatcher
}
