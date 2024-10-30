import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'

const getTotalPrice = (
  priceTypes: ORDER_PRICE_TYPES_ENUM[],
  withVat: boolean = true
) => ({
  $add: priceTypes.map((type) => ({
    $ifNull: [`$${type}.${withVat ? 'price' : 'priceWOVat'}`, 0],
  })),
})

const addPriceTypeFields = () => {
  let res = {}
  Object.values(ORDER_PRICE_TYPES_ENUM).forEach((type) => {
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
        totalWithVat: getTotalPrice(
          Object.values(ORDER_PRICE_TYPES_ENUM),
          true
        ),
        totalWOVat: getTotalPrice(Object.values(ORDER_PRICE_TYPES_ENUM), false),
      },
    },
  ]
}
