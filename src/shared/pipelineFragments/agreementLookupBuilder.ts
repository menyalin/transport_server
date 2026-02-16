import { PipelineStage } from 'mongoose'

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
        agreementName: '$agreement.name',
      },
    },
    {
      $unset: 'agreement',
    },
  ]
}
