import { BadRequestError } from '../../../../helpers/errors.js'

const docsNotGettedCond = () => {
  return {
    $eq: ['$docsState.getted', false],
  }
}

const docsReviewCond = () => ({
  $and: [
    { $eq: ['$docsState.getted', true] },
    { $eq: [0, { $ifNull: [{ $size: '$docs' }, 0] }] },
  ],
})

const docsCorrectionCond = () => ({
  $and: [
    { $eq: ['$docsState.getted', true] },
    { $gt: [{ $ifNull: [{ $size: '$docs' }, 0] }, 0] },
    {
      $gt: [
        {
          $ifNull: [
            {
              $size: {
                $filter: {
                  input: '$docs',
                  cond: { $eq: ['$$this.status', 'needFix'] },
                },
              },
            },
            0,
          ],
        },
        0,
      ],
    },
  ],
})

export const switchCondition = (state) => {
  if (!state)
    return {
      $or: [docsNotGettedCond(), docsReviewCond(), docsCorrectionCond()],
    }
  else
    switch (state) {
      case 'notGetted':
        return docsNotGettedCond()
      case 'review':
        return docsReviewCond()
      case 'correction':
        return docsCorrectionCond()
      default:
        throw new BadRequestError(`unexpected docs state: ${state}`)
    }
}

const docsAcceptedCond = () => ({
  $and: [
    { $eq: ['$docsState.getted', true] },
    { $gt: [{ $ifNull: [{ $size: '$docs' }, 0] }, 0] },
    {
      $eq: [
        {
          $ifNull: [
            {
              $size: {
                $filter: {
                  input: '$docs',
                  cond: { $eq: ['$$this.status', 'needFix'] },
                },
              },
            },
            0,
          ],
        },
        0,
      ],
    },
  ],
})

export const getOrderDocsStatus = () => {
  return {
    $switch: {
      branches: [
        {
          case: docsNotGettedCond(),
          then: { text: 'Не получены', color: 'red', value: 'notGetted' },
        },
        {
          case: docsReviewCond(),
          then: { text: 'На проверке', color: 'blue', value: 'review' },
        },
        {
          case: docsCorrectionCond(),
          then: {
            text: 'На исправлении',
            color: 'orange',
            value: 'correction',
          },
        },
        {
          case: docsAcceptedCond(),
          then: { text: 'Приняты', color: 'green', value: 'accepted' },
        },
      ],
      default: {
        text: 'Ошибка',
        color: 'red',
        value: 'error',
      },
    },
  }
}
