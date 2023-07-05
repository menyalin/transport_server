// @ts-nocheck
import { firstMatcher } from '../pipelines/grossProfitReportFragments/firstMatcher.js'
import { addPriceObjByTypes } from '../pipelines/grossProfitReportFragments/addPriceObjByTypes.js'
import { firstProject } from './grossProfitReportFragments/firstProject.js'
import { lookupAddressParams } from './grossProfitReportFragments/lookupAddressParams.js'
import { secondMatcher } from './grossProfitReportFragments/secondMatcher.js'
import { addTotalPriceFields } from '../pipelines/grossProfitReportFragments/addTotalPriceFields.js'
import { additionalMatcher } from '../pipelines/grossProfitReportFragments/additionalMatcher.js'
import { sortingList } from '../pipelines/grossProfitReportFragments/sortingList.js'

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
