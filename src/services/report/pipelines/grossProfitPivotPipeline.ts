import { PipelineStage } from 'mongoose'
import { firstMatcher } from '../pipelines/grossProfitReportFragments/firstMatcher'
import { addPriceObjByTypes } from '../pipelines/grossProfitReportFragments/addPriceObjByTypes'
import { firstProject } from './grossProfitReportFragments/firstProject'
import { lookupAddressParams } from './grossProfitReportFragments/lookupAddressParams'
import { secondMatcher } from './grossProfitReportFragments/secondMatcher'
import { addTotalPriceFields } from '../pipelines/grossProfitReportFragments/addTotalPriceFields'
import { lookupAgreements } from './grossProfitReportFragments/lookupAgreements'

type GroupByType =
  | 'client'
  | 'agreement'
  | 'orderType'
  | 'truck'
  | 'driver'
  | 'carrier'
  | 'loadingRegion'

interface GrossProfitPivotParams {
  company: string
  dateRange: [string, string]
  groupBy: GroupByType
  mainFilters?: Record<string, any>
}

const getGroupExpression = (groupBy: GroupByType): string => {
  switch (groupBy) {
    case 'client':
      return '$client'
    case 'agreement':
      return '$agreement'
    case 'orderType':
      return '$orderType'
    case 'truck':
      return '$truckId'
    case 'driver':
      return '$driverId'
    case 'carrier':
      return '$carrierId'
    case 'loadingRegion':
      return '$loadingRegions'
    default:
      return '$client'
  }
}

const getGroupStage = (groupBy: GroupByType): PipelineStage => ({
  $group: {
    _id: getGroupExpression(groupBy),
    totalCount: { $count: {} },
    totalWithVat: { $sum: '$totalWithVat' },
    totalWOVat: { $sum: '$totalWOVat' },
    avgWithVat: { $avg: '$totalWithVat' },
    avgWOVat: { $avg: '$totalWOVat' },
    outsourceCostsWOVat: { $sum: '$outsourceCostsWOVat' },
    outsourceCostsWithVat: { $sum: '$outsourceCostsWithVat' },

    totalProfitWOVat: {
      $sum: { $subtract: ['$totalWOVat', '$outsourceCostsWOVat'] },
    },

    totalProfitWithVat: {
      $sum: { $subtract: ['$totalWithVat', '$outsourceCostsWithVat'] },
    },

    avgOutsourceCostsWOVat: { $avg: '$outsourceCostsWOVat' },
    avgOutsourceCostsWithVat: { $avg: '$outsourceCostsWithVat' },

    avgProfitWOVat: {
      $avg: {
        $subtract: ['$totalWOVat', '$outsourceCostsWOVat'],
      },
    },

    avgProfitWithVat: {
      $avg: {
        $subtract: ['$totalWithVat', '$outsourceCostsWithVat'],
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
})

const getTotalStage = (): PipelineStage => ({
  $group: {
    _id: null,
    totalCount: { $count: {} },
    totalWithVat: { $sum: '$totalWithVat' },
    totalWOVat: { $sum: '$totalWOVat' },
    outsourceCostsWOVat: { $sum: '$outsourceCostsWOVat' },
    outsourceCostsWithVat: { $sum: '$outsourceCostsWithVat' },
    totalProfitWOVat: {
      $sum: { $subtract: ['$totalWOVat', '$outsourceCostsWOVat'] },
    },
    totalProfitWithVat: {
      $sum: { $subtract: ['$totalWithVat', '$outsourceCostsWithVat'] },
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
})

export default ({
  dateRange,
  company,
  groupBy,
  mainFilters,
}: GrossProfitPivotParams): PipelineStage[] => {
  return [
    firstMatcher({ company, dateRange, mainFilters }),
    addPriceObjByTypes(['prices', 'prePrices', 'finalPrices']),
    firstProject(),
    ...lookupAddressParams(),
    ...lookupAgreements(),
    secondMatcher({ filters: mainFilters }),
    ...addTotalPriceFields(),
    // Приводим carrierId к строке для корректной группировки
    {
      $addFields: {
        carrierId: {
          $cond: {
            if: { $ifNull: ['$carrierId', false] },
            then: { $toString: '$carrierId' },
            else: 'Без перевозчика',
          },
        },
      },
    },

    {
      $facet: {
        items: [getGroupStage(groupBy), { $sort: { totalWithVat: -1 } }],
        total: [getTotalStage()],
      },
    } as PipelineStage,
    {
      $addFields: {
        items: '$items',
        total: { $arrayElemAt: ['$total', 0] },
      },
    },
  ]
}
