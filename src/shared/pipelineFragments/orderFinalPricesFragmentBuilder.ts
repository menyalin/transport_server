import { ORDER_PRICE_TYPES_ENUM_VALUES } from '@/constants/priceTypes'
const priceGroups = ['$finalPrices', '$prices', '$prePrices']

const getTotalPriceByType = (type: string) => ({
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
        price: {
          $getField: {
            field: 'price',
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
        priceWOVat: {
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
      },
    })),

    default: {
      price: 0,
      priceWOVat: 0,
    },
  },
})

export const finalPricesFragmentBuilder = () => {
  let res = {}
  ORDER_PRICE_TYPES_ENUM_VALUES.forEach((priceType) => {
    res = Object.assign(res, { [priceType]: getTotalPriceByType(priceType) })
  })
  return res
}

// totalByTypes
export const totalSumFragmentBuilder = () => ({
  $reduce: {
    input: { $objectToArray: '$totalByTypes' },
    initialValue: { price: 0, priceWOVat: 0 },
    in: {
      price: {
        $add: [
          '$$value.price',
          {
            $add: [
              '$$this.v.priceWOVat',
              { $multiply: ['$$this.v.priceWOVat', '$agreementVatRate', 0.01] },
            ],
          },
        ],
      },
      priceWOVat: { $add: ['$$value.priceWOVat', '$$this.v.priceWOVat'] },
    },
  },
})
