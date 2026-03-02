import { PipelineStage } from 'mongoose'
import {
  finalPricesFragmentBuilder,
  recalcTotalByTypesFragmentBuilder,
} from './orderFinalPricesFragmentBuilder'
import { calcTotalBuilder } from '@/shared/pipelineFragments/calcTotalBuilder'

export const totalByTypesFragementBuilder = (): PipelineStage[] => {
  return [
    { $addFields: { totalByTypes: finalPricesFragmentBuilder() } },

    { $addFields: { totalByTypes: recalcTotalByTypesFragmentBuilder() } },

    { $addFields: { total: calcTotalBuilder() } },
  ]
}
