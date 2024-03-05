export const substructPaymentPartsFromBase = () => ({
  $addFields: {
    'totalByTypes.base.priceWOVat': {
      $subtract: [
        '$totalByTypes.base.priceWOVat',
        { $ifNull: ['$paymentPartsSumWOVat', 0] },
      ],
    },
    'totalByTypes.base.price': {
      $subtract: [
        '$totalByTypes.base.price',
        { $ifNull: ['$paymentPartsSumWithVat', 0] },
      ],
    },
  },
})
