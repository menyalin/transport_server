// @ts-nocheck
export const orderDocNumbersStringFragment = ({
  docsFieldName,
  onlyForAddToRegistry,
}) => ({
  $trim: {
    chars: ', ',
    input: {
      $reduce: {
        initialValue: '',
        input: {
          $reduce: {
            initialValue: [],
            in: {
              $cond: [
                { $in: ['$$this.number', '$$value'] },
                '$$value',
                { $concatArrays: ['$$value', ['$$this.number']] },
              ],
            },
            input: {
              $filter: {
                cond: {
                  $and: [
                    onlyForAddToRegistry
                      ? { $ne: ['$$this.addToRegistry', false] }
                      : {},

                    {
                      $ne: [
                        {
                          $strLenCP: {
                            $trim: {
                              chars: ' ',
                              input: { $ifNull: ['$$this.number', ' '] },
                            },
                          },
                        },
                        0,
                      ],
                    },
                  ],
                },
                input: docsFieldName,
              },
            },
          },
        },
        in: { $concat: ['$$value', '$$this', ', '] },
      },
    },
  },
})
