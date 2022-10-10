import { BadRequestError } from '../../../../helpers/errors.js'

/* 
const _docStatuses = [
  { value: 'accepted', text: 'Приняты' },
      { value: 'needFix', text: 'На исправлении' },
      { value: 'onCheck', text: 'На проверке' },
      { value: 'missing', text: 'Не получены' },
]
*/

export const getDocFragmentBuilder = (
  docStatus,
  docsFieldName = '$docs',
  docStateField = '$docsState.getted'
) => {
  switch (docStatus) {
    case 'accepted':
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
                      $ne: ['$$this.status', 'accepted'],
                    },
                  },
                },
              },
              0,
            ],
          },
        ],
      }
    case 'needFix':
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
                          $eq: ['$$this.status', 'needFix'],
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
                          $eq: ['$$this.status', 'missing'],
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

    case 'onCheck':
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
    case 'missing':
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
      throw new BadRequestError('getDocFragmentBuilder: unexpected doc status')
  }
}
