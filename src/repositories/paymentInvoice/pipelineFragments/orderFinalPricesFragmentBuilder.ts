import { ORDER_PRICE_TYPES_ENUM_VALUES } from '../../../constants/priceTypes'
const priceGroups = ['$finalPrices', '$prices', '$prePrices']

// Получить базовую цену для типа (в зависимости от usePriceWithVat)
const getBasePriceByType = (type: string, usePriceWithVat: boolean) => ({
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
          // Если usePriceWithVat = true, берём price как базу (она сохраняется)
          // Если usePriceWithVat = false, берём priceWOVat как базу (он сохраняется)
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

// Создаёт объект с базовыми ценами для каждого типа
export const finalPricesFragmentBuilder = (usePriceWithVat: boolean) => {
  let res = {}
  ORDER_PRICE_TYPES_ENUM_VALUES.forEach((priceType) => {
    res = Object.assign(res, {
      [priceType]: getBasePriceByType(priceType, usePriceWithVat),
    })
  })
  return res
}

// Пересчитывает totalByTypes из базовых цен в { price, priceWOVat } с учётом vatRate

export const recalcTotalByTypesFragmentBuilder = (
  priceTypes: string[] = ORDER_PRICE_TYPES_ENUM_VALUES
) => {
  const vatRateDivisor = {
    $add: [1, { $multiply: ['$agreementVatRate', 0.01] }],
  }

  let res = {}
  priceTypes.forEach((priceType) => {
    res = Object.assign(res, {
      [priceType]: {
        $cond: {
          if: '$usePriceWithVat',
          then: {
            price: `$totalByTypes.${priceType}`,
            priceWOVat: {
              $divide: [`$totalByTypes.${priceType}`, vatRateDivisor],
            },
          },
          else: {
            price: {
              $multiply: [`$totalByTypes.${priceType}`, vatRateDivisor],
            },
            priceWOVat: `$totalByTypes.${priceType}`,
          },
        },
      },
    })
  })
  return res
}

// Суммирует price из всех типов totalByTypes
export const totalSumFragmentBuilder = () => ({
  $reduce: {
    input: { $objectToArray: '$totalByTypes' },
    initialValue: 0,
    in: {
      $add: ['$$value', '$$this.v.price'],
    },
  },
})
