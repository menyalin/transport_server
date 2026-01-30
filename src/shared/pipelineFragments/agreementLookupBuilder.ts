import { PipelineStage } from 'mongoose'

// Получает agreement и опционально извлекает vatRate
export const agreementLookupBuilder = (
  localField = 'client.agreement'
): PipelineStage[] => {
  return [
    {
      $lookup: {
        from: 'agreements',
        localField: localField,
        foreignField: '_id',
        as: 'agreement',
      },
    },
    {
      $addFields: {
        agreement: { $first: '$agreement' },
      },
    },
    {
      $addFields: {
        usePriceWithVat: '$agreement.usePriceWithVAT',
      },
    },
    {
      $unset: 'agreement',
    },
  ]
}
