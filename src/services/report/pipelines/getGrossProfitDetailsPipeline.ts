// @ts-nocheck
import { firstMatcher } from '../pipelines/grossProfitReportFragments/firstMatcher'
import { addPriceObjByTypes } from '../pipelines/grossProfitReportFragments/addPriceObjByTypes'
import { firstProject } from './grossProfitReportFragments/firstProject'
import { lookupAddressParams } from './grossProfitReportFragments/lookupAddressParams'
import { secondMatcher } from './grossProfitReportFragments/secondMatcher'
import { addTotalPriceFields } from '../pipelines/grossProfitReportFragments/addTotalPriceFields'
import { additionalMatcher } from '../pipelines/grossProfitReportFragments/additionalMatcher'
import { sortingList } from '../pipelines/grossProfitReportFragments/sortingList'

export default ({
  dateRange,
  company,
  mainFilters,
  additionalFilters,
  listOptions,
}) => {
  const finalGroup = [
    // {
    //   $sort: {
    //     [sortingField]: sortingDirection,
    //   },
    // },
    {
      $group: {
        _id: 'orders',
        items: {
          $push: '$$ROOT',
        },
      },
    },
    {
      $addFields: {
        count: {
          $size: '$items',
        },
        items: {
          $slice: [
            '$items',
            (listOptions.page - 1) * listOptions.itemsPerPage,
            listOptions.itemsPerPage,
          ],
        },
      },
    },
  ]

  return [
    firstMatcher({ company, dateRange, mainFilters }),
    addPriceObjByTypes(['prices', 'prePrices', 'finalPrices']),
    firstProject(),
    ...lookupAddressParams(),
    additionalMatcher(additionalFilters),
    secondMatcher({ filters: mainFilters }),
    secondMatcher({ filters: additionalFilters }),
    ...addTotalPriceFields(),
    ...sortingList(listOptions),
    ...finalGroup,
  ]
}
