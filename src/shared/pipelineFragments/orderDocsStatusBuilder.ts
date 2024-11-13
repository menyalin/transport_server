import { ORDER_DOC_STATUSES_ENUM } from '@/constants/orderDocsStatus'
import { PipelineStage } from 'mongoose'

const acceptedDocsCountFragment = {
  $size: {
    $filter: {
      input: '$docs',
      cond: { $eq: ['$$this.status', 'accepted'] },
    },
  },
}
const sizeDocsFragment = {
  $size: '$docs',
}

export const orderDocsStatusBuilder = (): PipelineStage[] => [
  {
    $addFields: {
      docsStatus: {
        $switch: {
          branches: [
            {
              case: {
                $and: [
                  { $eq: ['$docsState.getted', false] },
                  { $eq: [sizeDocsFragment, 0] },
                ],
              },
              then: ORDER_DOC_STATUSES_ENUM.missing,
            },

            {
              case: {
                $and: [
                  { $eq: ['$docsState.getted', true] },
                  { $eq: [sizeDocsFragment, 0] },
                ],
              },
              then: ORDER_DOC_STATUSES_ENUM.onCheck,
            },
            {
              case: {
                $and: [
                  { $eq: ['$docsState.getted', true] },
                  { $ne: [sizeDocsFragment, acceptedDocsCountFragment] },
                ],
              },
              then: ORDER_DOC_STATUSES_ENUM.needFix,
            },

            {
              case: {
                $and: [
                  { $eq: ['$docsState.getted', true] },
                  { $eq: [sizeDocsFragment, acceptedDocsCountFragment] },
                ],
              },
              then: ORDER_DOC_STATUSES_ENUM.accepted,
            },
          ],
        },
      },
    },
  },
]
