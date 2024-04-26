import { PipelineStage, Types } from 'mongoose'
import { GetDocsCountProps } from '@/classes/getOrdersCountHandlerProps'
import { orderDateFragmentBuilder } from '@/shared/pipelineFragments/orderDateFragmentBuilder'

export const getOrdersMatcher = (p: GetDocsCountProps): PipelineStage.Match => {
  const matcher: PipelineStage.Match = {
    $match: {
      company: new Types.ObjectId(p.company),
      'state.status': p.status,
      isActive: p.isActive,
      $expr: {
        $and: [
          { $gte: [orderDateFragmentBuilder(), p.period.start] },
          { $lt: [orderDateFragmentBuilder(), p.period.end] },
        ],
      },
    },
  }

  return matcher
}
