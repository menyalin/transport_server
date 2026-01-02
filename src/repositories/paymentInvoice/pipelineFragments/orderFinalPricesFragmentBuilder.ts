import { ORDER_PRICE_TYPES_ENUM_VALUES } from '../../../constants/priceTypes'
const priceGroups = ['$finalPrices', '$prices', '$prePrices']

const getTotalPriceByType = (type: string, usePriceWithVat: boolean) => ({
  $switch: {
    branches: priceGroups.map((group) => ({
      case: {
        $gte: [
          {
            $size: {
              $filter: {
                input: { $ifNull: [group, []] },
                cond: { $eq: ['$$this.type', type] },
              },
            },
          },
          1,
        ],
      },
      then: {
        $getField: {
          field: usePriceWithVat ? 'price' : 'priceWOVat',
          input: {
            $first: {
              $filter: {
                input: group,
                cond: { $eq: ['$$this.type', type] },
              },
            },
          },
        },
      },
    })),

    default: 0,
  },
})

export const finalPricesFragmentBuilder = (usePriceWithVat: boolean) => {
  let res = {}
  ORDER_PRICE_TYPES_ENUM_VALUES.forEach((priceType) => {
    res = Object.assign(res, {
      [priceType]: getTotalPriceByType(priceType, usePriceWithVat),
    })
  })
  return res
}

// totalByTypes
export const totalSumFragmentBuilder = () => ({
  $reduce: {
    input: { $objectToArray: '$totalByTypes' },
    initialValue: 0,
    in: {
      $add: ['$$value', '$$this.v'],
    },
  },
})
