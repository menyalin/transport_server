import { ORDER_PRICE_TYPES_ENUM } from '../../constants/priceTypes.js'
const priceGroups = ['$finalPrices', '$prices', '$prePrices']

const getTotalPriceByType = (type) => ({
  $switch: {
    branches: priceGroups.map((group) => ({
      case: {
        $gte: [
          {
            $size: {
              $filter: {
                input: group,
                cond: { $eq: ['$$this.type', type] },
              },
            },
          },
          1,
        ],
      },
      then: {
        $first: {
          $filter: {
            input: group,
            cond: { $eq: ['$$this.type', type] },
          },
        },
      },
    })),

    default: { price: 0, priceWOVat: 0, sumVat: 0 },
  },
})

export const finalPricesFragmentBuilder = () => {
  const res = {}

  ORDER_PRICE_TYPES_ENUM.forEach((priceType) => {
    res[priceType] = getTotalPriceByType(priceType)
  })
  return res
}

// totalByTypes
export const totalSumFragmentBuilder = () => ({
  $reduce: {
    input: { $objectToArray: '$totalByTypes' },
    initialValue: { price: 0, priceWOVat: 0, sumVat: 0 },
    in: {
      price: { $add: ['$$value.price', '$$this.v.price'] },
      priceWOVat: { $add: ['$$value.priceWOVat', '$$this.v.priceWOVat'] },
      sumVat: { $add: ['$$value.sumVat', '$$this.v.sumVat'] },
    },
  },
})
