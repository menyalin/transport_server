import { PipelineStage } from 'mongoose'
import {
  finalPricesFragmentBuilder,
  recalcTotalByTypesFragmentBuilder,
} from './orderFinalPricesFragmentBuilder'
import { calcTotalBuilder } from '@/shared/pipelineFragments/calcTotalBuilder'
import { paymentPartsSumBuilder } from '@/shared/pipelineFragments/paymentPartsSumBuilder'

export const totalByTypesFragementBuilder = (
  isPaymentPart = false
): PipelineStage[] => {
  if (isPaymentPart)
    return [
      {
        $addFields: {
          _basePrice: {
            $cond: {
              if: '$$ROOT.usePriceWithVat',
              then: '$paymentParts.price',
              else: '$paymentParts.priceWOVat',
            },
          },
        },
      },
      {
        $addFields: {
          totalByTypes: {
            base: '$_basePrice',
          },
        },
      },
      {
        $addFields: {
          totalByTypes: recalcTotalByTypesFragmentBuilder(['base']),
        },
      },
      {
        $addFields: {
          total: calcTotalBuilder(),
        },
      },
    ]
  else
    return [
      { $addFields: { paymentPartsSum: paymentPartsSumBuilder() } },
      { $unset: ['paymentParts'] },
      { $addFields: { totalByTypes: finalPricesFragmentBuilder() } },
      {
        $addFields: {
          totalByTypes: {
            $mergeObjects: [
              '$totalByTypes',
              {
                base: {
                  $subtract: ['$totalByTypes.base', '$paymentPartsSum'],
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          totalByTypes: recalcTotalByTypesFragmentBuilder(),
        },
      },
      {
        $addFields: {
          total: calcTotalBuilder(),
        },
      },
    ]
}
