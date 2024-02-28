import { ORDER_PRICE_TYPES_ENUM_VALUES } from '../../../constants/priceTypes'
const priceGroups = ['$finalPrices', '$prices', '$prePrices']

const getTotalPriceWOVatByType = (type: string) => ({
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
          field: 'priceWOVat',
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

export const finalPricesWOVatFragmentBuilder = () => {
  let res = {}
  ORDER_PRICE_TYPES_ENUM_VALUES.forEach((priceType) => {
    res = Object.assign(res, {
      [priceType]: getTotalPriceWOVatByType(priceType),
    })
  })
  return res
}

// totalByTypes
export const totalSumWOVatFragmentBuilder = () => ({
  $reduce: {
    input: { $objectToArray: '$totalWOVatByTypes' },
    initialValue: 0,
    in: {
      $add: ['$$value', '$$this.v'],
    },
  },
})
