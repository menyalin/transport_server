// @ts-nocheck
import { ORDER_PRICE_TYPES_ENUM } from '../../../../constants/priceTypes'

const getTotalPrice = (priceTypes, withVat = true) => ({
  $add: priceTypes.map((type) => ({
    $ifNull: [`$${type}.${withVat ? 'price' : 'priceWOVat'}`, 0],
  })),
})

const addPriceTypeFields = () => {
  let res = {}
  ORDER_PRICE_TYPES_ENUM.forEach((type) => {
    res = Object.assign(res, {
      [type]: {
        $ifNull: [
          '$finalPrices.' + type,
          '$prices.' + type,
          '$prePrices.' + type,
        ],
      },
    })
  })
  return { $addFields: { ...res } }
}

export const addTotalPriceFields = () => {
  return [
    addPriceTypeFields(),
    {
      $addFields: {
        totalWithVat: getTotalPrice(ORDER_PRICE_TYPES_ENUM, true),
        totalWOVat: getTotalPrice(ORDER_PRICE_TYPES_ENUM, false),
      },
    },
  ]
}
