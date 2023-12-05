export const paymentPartsSumFragment = (withVat: boolean) => ({
  $reduce: {
    initialValue: 0,
    input: '$paymentParts',
    in: { $add: ['$$value', withVat ? '$$this.price' : '$$this.priceWOVat'] },
  },
})
