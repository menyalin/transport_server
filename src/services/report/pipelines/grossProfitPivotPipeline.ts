// @ts-nocheck
import { firstMatcher } from '../pipelines/grossProfitReportFragments/firstMatcher'
import { addPriceObjByTypes } from '../pipelines/grossProfitReportFragments/addPriceObjByTypes'
import { firstProject } from './grossProfitReportFragments/firstProject'
import { lookupAddressParams } from './grossProfitReportFragments/lookupAddressParams'
import { secondMatcher } from './grossProfitReportFragments/secondMatcher'
import { addTotalPriceFields } from '../pipelines/grossProfitReportFragments/addTotalPriceFields'
import { lookupAgreements } from './grossProfitReportFragments/lookupAgreements'
import { PipelineStage } from 'mongoose'

export default ({
  dateRange,
  company,
  groupBy,
  mainFilters,
}): PipelineStage[] => {
  const group = (groupBy) => {
    let groupType
    switch (groupBy) {
      case 'client':
        groupType = '$client'
        break
      case 'agreement':
        groupType = '$agreement'
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
        outsourceCostsWOVat: { $sum: '$outsourceCostsWOVat' },
        totalProfitWOVat: {
          $sum: {
            $subtract: ['$totalWOVat', '$outsourceCostsWOVat'],
          },
        },
        avgOutsourceCostsWOVat: { $avg: '$outsourceCostsWOVat' },
        avgProfitWOVat: {
          $avg: {
            $subtract: ['$totalWOVat', '$outsourceCostsWOVat'],
          },
        },
        avgProfitWOVatPercent: {
          $avg: {
            $cond: {
              if: { $eq: ['$totalWOVat', 0] },
              then: 0,
              else: {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$totalWOVat', '$outsourceCostsWOVat'] },
                      '$totalWOVat',
                    ],
                  },
                  100,
                ],
              },
            },
          },
        },
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
      outsourceCostsWOVat: { $sum: '$outsourceCostsWOVat' },
      totalProfitWOVat: { $sum: '$totalProfitWOVat' },
      avgProfitWOVatPercent: {
        $avg: {
          $cond: {
            if: { $eq: ['$totalWOVat', 0] },
            then: 0,
            else: {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ['$totalWOVat', '$outsourceCostsWOVat'] },
                    '$totalWOVat',
                  ],
                },
                100,
              ],
            },
          },
        },
      },
    },
  }

  return [
    firstMatcher({ company, dateRange, mainFilters }),
    addPriceObjByTypes(['prices', 'prePrices', 'finalPrices']),
    firstProject(),
    ...lookupAddressParams(),
    ...lookupAgreements(),
    secondMatcher({ filters: mainFilters }),
    ...addTotalPriceFields(),
    { $sort: { totalWithVat: -1 } },
    group(groupBy),
    { $sort: { totalWithVat: -1 } },
    finalGroup,
  ]
}
