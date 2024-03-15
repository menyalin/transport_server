import { PipelineStage } from 'mongoose'

export const lookupAgreements = (): PipelineStage[] => {
  return [
    {
      $lookup: {
        from: 'agreements',
        localField: 'agreement',
        foreignField: '_id',
        as: '_agreement',
      },
    },
    {
      $addFields: {
        _agreement: { $first: '$_agreement' },
      },
    },
    { $addFields: { agreementName: '$_agreement.name' } },
  ]
}
