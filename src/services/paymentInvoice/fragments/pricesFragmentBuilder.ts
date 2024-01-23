// @ts-nocheck
import { ORDER_PRICE_TYPES_ENUM_VALUES } from '../../../constants/priceTypes'
const priceGroups = ['$finalPrices', '$prices', '$prePrices']
/*
  agreementVatRate : [ 20, 0 ]
  itemType: ['paymentPart', 'order']
  paymentPartsSumWOVat
*/

const isPaymentPartCondition = () => ({
  $eq: ['$itemType', 'paymentPart'],
})

const paymentPartBasePriceFragment = () => ({
  base: {
    priceWOVat: '$paymentParts.priceWOVat',
    price: {
      $add: [
        '$paymentParts.priceWOVat',
        { $multiply: ['$paymentParts.priceWOVat', '$agreementVatRate', 0.01] },
      ],
    },
  },
})

const getPriceWOVatFieldFragment = ({ group, type }) => {
  const fragment = {
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
  }

  if (type === 'base') return { $subtract: [fragment, '$paymentPartsSumWOVat'] }
  return fragment
}

const getTotalPriceByType = (type) => ({
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
        priceWOVat: getPriceWOVatFieldFragment({ type, group }),
        price: {
          $add: [
            getPriceWOVatFieldFragment({ type, group }),
            {
              $multiply: [
                getPriceWOVatFieldFragment({ type, group }),
                '$agreementVatRate',
                0.01,
              ],
            },
          ],
        },
      },
    })),
    default: { priceWOVat: 0, price: 0 },
  },
})

const orderPricesFragment = () => {
  const res = {}
  ORDER_PRICE_TYPES_ENUM_VALUES.forEach((priceType) => {
    res[priceType] = getTotalPriceByType(priceType)
  })
  return res
}

export const pricesFragmentBuilder = () => [
  {
    $addFields: {
      totalByTypes: {
        $cond: {
          if: isPaymentPartCondition(),
          then: paymentPartBasePriceFragment(),
          else: orderPricesFragment(),
        },
      },
    },
  },
  {
    $addFields: {
      _totalByTypes: { $objectToArray: '$totalByTypes' },
    },
  },
  {
    $addFields: {
      total: {
        $reduce: {
          input: '$_totalByTypes',
          initialValue: { price: 0, priceWOVat: 0 },
          in: {
            price: { $add: ['$$value.price', '$$this.v.price'] },
            priceWOVat: { $add: ['$$value.priceWOVat', '$$this.v.priceWOVat'] },
          },
        },
      },
    },
  },
  {
    $unset: ['_totalByTypes'],
  },
]
