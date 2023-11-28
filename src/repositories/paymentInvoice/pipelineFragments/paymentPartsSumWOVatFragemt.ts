export const paymentPartsSumWOVatFragemt = {
  $reduce: {
    initialValue: 0,
    input: '$paymentParts',
    in: { $add: ['$$value', '$$this.priceWOVat'] },
  },
}
