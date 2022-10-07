import { BadRequestError } from '../../../../helpers/errors.js'

/* 
const _docStatuses = [
  { value: 'accepted', text: 'Принят' },
  { value: 'needFix', text: 'Требуется исправление' },
  { value: 'missing', text: 'Отсутсвует' },
]
*/

export const getDocFragmentBuilder = (docStatus) => {
  switch (docStatus) {
    case 'accepted':
      return {
        $and: [
          { $isArray: '$docs' },
          { $gt: [{ $size: '$docs' }, 0] },
          {
            $eq: [
              {
                $size: {
                  $filter: {
                    input: '$docs',
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
          { $isArray: '$docs' },
          { $gt: [{ $size: '$docs' }, 0] },
          {
            $or: [
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: '$docs',
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
                        input: '$docs',
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
    case 'missing':
      return {
        $or: [
          { $not: { $isArray: '$docs' } },
          { $eq: [{ $size: '$docs' }, 0] },
        ],
      }

    default:
      throw new BadRequestError('getDocFragmentBuilder: unexpected doc status')
  }
}
