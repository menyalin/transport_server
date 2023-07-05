// @ts-nocheck
import { firstMatcher } from '../pipelines/grossProfitReportFragments/firstMatcher.js'
import { addPriceObjByTypes } from '../pipelines/grossProfitReportFragments/addPriceObjByTypes.js'
import { firstProject } from './grossProfitReportFragments/firstProject.js'
import { lookupAddressParams } from './grossProfitReportFragments/lookupAddressParams.js'
import { secondMatcher } from './grossProfitReportFragments/secondMatcher.js'
import { addTotalPriceFields } from '../pipelines/grossProfitReportFragments/addTotalPriceFields.js'
import { additionalMatcher } from './grossProfitReportFragments/additionalMatcher.js'

export default ({ dateRange, company, groupBy, mainFilters }) => {
  const group = (groupBy) => {
    let groupType
    switch (groupBy) {
      case 'client':
        groupType = '$client'
        break
      case 'orderType':
        groupType = '$orderType'
        break
      case 'truck':
        groupType = '$truckId'
        break
      case 'driver':
        groupType = '$driverId'
        break
      case 'tkName':
        groupType = '$tkName'
        break
      case 'loadingRegion':
        groupType = '$loadingRegions'
        break
    }

    return {
      $group: {
        _id: groupType,
        // orders: { $push: '$$ROOT' },
        totalCount: { $count: {} },
        totalWithVat: { $sum: '$totalWithVat' },
        totalWOVat: { $sum: '$totalWOVat' },
        avgWithVat: { $avg: '$totalWithVat' },
        avgWOVat: { $avg: '$totalWOVat' },
      },
    }
  }

  const finalGroup = {
    $group: {
      _id: groupBy,
      items: { $push: '$$ROOT' },
      totalCount: { $sum: '$totalCount' },
      totalWithVat: { $sum: '$totalWithVat' },
      totalWOVat: { $sum: '$totalWOVat' },
    },
  }

  return [
    firstMatcher({ company, dateRange, mainFilters }),
    addPriceObjByTypes(['prices', 'prePrices', 'finalPrices']),
    firstProject(),
    ...lookupAddressParams(),
    secondMatcher({ filters: mainFilters }),
    ...addTotalPriceFields(),
    { $sort: { totalWithVat: -1 } },
    group(groupBy),
    { $sort: { totalWithVat: -1 } },
    finalGroup,
  ]
}
