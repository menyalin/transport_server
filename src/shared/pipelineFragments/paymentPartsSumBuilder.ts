import { Expression } from 'mongoose'

export const paymentPartsSumBuilder = (): Expression => ({
  $reduce: {
    initialValue: 0,
    input: '$paymentParts',
    in: {
      $add: [
        '$$value',
        {
          $cond: {
            if: '$$ROOT.usePriceWithVat',
            then: '$$this.price',
            else: '$$this.priceWOVat',
          },
        },
      ],
    },
  },
})
