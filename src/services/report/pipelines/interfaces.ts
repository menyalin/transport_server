import { Types } from 'mongoose'

export type FilterCondition = 'in' | 'not'

export type FilterValue = string | Types.ObjectId

export type FilterItem = {
  cond: FilterCondition
  values: FilterValue[]
}

export type MainFilters = {
  clients?: FilterItem
  agreements?: FilterItem
  carriers?: FilterItem
  trucks?: FilterItem
  drivers?: FilterItem
  orderTypes?: FilterItem
}

export type FirstMatcherParams = {
  company: string
  dateRange: [string, string]
  mainFilters: MainFilters
}
