import { firstMatcher } from '../pipelines/grossProfitReportFragments/firstMatcher.js'
import { addPriceObjByTypes } from '../pipelines/grossProfitReportFragments/addPriceObjByTypes.js'
import { firstProject } from './grossProfitReportFragments/firstProject.js'
import { lookupAddressParams } from './grossProfitReportFragments/lookupAddressParams.js'
import { secondMatcher } from './grossProfitReportFragments/secondMatcher.js'
import { addTotalPriceFields } from '../pipelines/grossProfitReportFragments/addTotalPriceFields.js'
import { additionalMatcher } from '../pipelines/grossProfitReportFragments/additionalMatcher.js'
/*
{
  clients: { values: [], cond: 'in' },
  tkNames: { values: [], cond: 'in' },
  trucks: { values: [], cond: 'in' },
  drivers: { values: [], cond: 'in' },
  orderTypes: { values: [], cond: 'in' },
  loadingRegions: { values: [], cond: 'in' },
  unloadingRegions: { values: [], cond: 'in' },
  loadingZones: { values: [], cond: 'in' },
  unloadingZones: { values: [], cond: 'in' }
}
*/

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
