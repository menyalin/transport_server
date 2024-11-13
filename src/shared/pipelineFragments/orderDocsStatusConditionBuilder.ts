import { ORDER_DOC_STATUSES_ENUM } from '@/constants/orderDocsStatus'
import { BadRequestError } from '@/helpers/errors'

/* 
const _docStatuses = [
  { value: 'accepted', text: 'Приняты' },
      { value: 'needFix', text: 'На исправлении' },
      { value: 'onCheck', text: 'На проверке' },
      { value: 'missing', text: 'Не получены' },
]
*/

export const orderDocsStatusConditionBuilder = (
  docStatus: ORDER_DOC_STATUSES_ENUM,
  docsFieldName = '$docs',
  docStateField = '$docsState.getted'
) => {
  switch (docStatus) {
    case ORDER_DOC_STATUSES_ENUM.accepted:
      return {
        $and: [
          { $eq: [docStateField, true] },
          { $isArray: docsFieldName },
          { $gt: [{ $size: docsFieldName }, 0] },
          {
            $eq: [
              {
                $size: {
                  $filter: {
                    input: docsFieldName,
                    cond: {
                      $ne: ['$$this.status', ORDER_DOC_STATUSES_ENUM.accepted],
                    },
                  },
                },
              },
              0,
            ],
          },
        ],
      }
    case ORDER_DOC_STATUSES_ENUM.needFix:
      return {
        $and: [
          { $eq: [docStateField, true] },
          { $isArray: docsFieldName },
          { $gt: [{ $size: docsFieldName }, 0] },
          {
            $or: [
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: docsFieldName,
                        cond: {
                          $eq: [
                            '$$this.status',
                            ORDER_DOC_STATUSES_ENUM.needFix,
                          ],
                        },
                      },
                    },
                  },
                  0,
                ],
              },
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: docsFieldName,
                        cond: {
                          $eq: [
                            '$$this.status',
                            ORDER_DOC_STATUSES_ENUM.missing,
                          ],
                        },
                      },
                    },
                  },
                  0,
                ],
              },
            ],
          },
        ],
      }

    case ORDER_DOC_STATUSES_ENUM.onCheck:
      return {
        $and: [
          { $eq: [docStateField, true] },
          {
            $or: [
              { $not: { $isArray: docsFieldName } },
              { $eq: [{ $size: docsFieldName }, 0] },
            ],
          },
        ],
      }
    case ORDER_DOC_STATUSES_ENUM.missing:
      return {
        $and: [
          { $ne: [docStateField, true] },
          {
            $or: [
              { $not: { $isArray: docsFieldName } },
              { $eq: [{ $size: docsFieldName }, 0] },
            ],
          },
        ],
      }

    default:
      throw new BadRequestError(
        'orderDocsStatusConditionBuilder: unexpected doc status'
      )
  }
}
