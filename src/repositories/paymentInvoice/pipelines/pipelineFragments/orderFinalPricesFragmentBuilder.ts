import { ORDER_PRICE_TYPES_ENUM_VALUES } from '@/constants/priceTypes'
const priceGroups = ['$finalPrices', '$prices', '$prePrices']

// Получить базовую цену для типа (в зависимости от usePriceWithVat)
const getBasePriceByType = (type: string) => ({
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
        $cond: {
          if: '$$ROOT.usePriceWithVat',
          then: {
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
          else: {
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
      },
    })),

    default: 0,
  },
})

// Создаёт объект с базовыми ценами для каждого типа
export const finalPricesFragmentBuilder = (
  types: string[] = ORDER_PRICE_TYPES_ENUM_VALUES
) => {
  let res = {}
  types.forEach((priceType) => {
    res = Object.assign(res, {
      [priceType]: getBasePriceByType(priceType),
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
          if: '$$ROOT.usePriceWithVat',
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
