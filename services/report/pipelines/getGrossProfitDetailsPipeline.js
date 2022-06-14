/*
  --------- list options format
  page: 1,
  itemsPerPage: 100,
  sortBy: [],
  sortDesc: [ false ],
  groupBy: [],
  groupDesc: [],
  mustSort: false,
  multiSort: false
*/

import { firstMatcher } from '../pipelines/grossProfitReportFragments/firstMatcher.js'
import { addPriceObjByTypes } from '../pipelines/grossProfitReportFragments/addPriceObjByTypes.js'
import { firstProject } from './grossProfitReportFragments/firstProject.js'
import { lookupAddressParams } from './grossProfitReportFragments/lookupAddressParams.js'
import { secondMatcher } from './grossProfitReportFragments/secondMatcher.js'
import { addTotalPriceFields } from '../pipelines/grossProfitReportFragments/addTotalPriceFields.js'

export default ({ dateRange, company, mainFilters, listOptions }) => {
  console.log(listOptions)
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
    secondMatcher({ mainFilters }),
    ...addTotalPriceFields(),
    {
      $sort: {
        orderDate: 1,
      },
    },
    ...finalGroup,
  ]
}
