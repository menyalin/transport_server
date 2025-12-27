import { Expression, PipelineStage, Types } from 'mongoose'
import { GetAgreementsForClientProps } from '../schemas'

export default (p: GetAgreementsForClientProps): PipelineStage[] => {
  const conditions: Expression[] = [
    { $eq: ['$isActive', true] },
    { $ne: ['$closed', true] },
    { $lte: ['$date', p.date] },
    p.client ? { $in: [new Types.ObjectId(p.client), '$clients'] } : null,
    p.clients && p.clients.length
      ? {
          $or: p.clients.map((i) => ({
            $in: [new Types.ObjectId(i), '$clients'],
          })),
        }
      : null,
    {
      $or: [
        { $eq: [{ $ifNull: ['$endDate', null] }, null] },
        { $gt: ['$endDate', p.date] },
      ],
    },
  ].filter(Boolean)

  const firstMatcher: PipelineStage.Match = {
    $match: {
      company: new Types.ObjectId(p.company),
      $expr: {
        $or: [
          { $eq: ['$_id', new Types.ObjectId(p.currentAgreementId)] },
          { $and: conditions },
        ],
      },
    },
  }

  return [
    firstMatcher,
    { $sort: { date: -1 } },
    { $group: { _id: '$_id', items: { $push: '$$ROOT' } } },
    { $replaceRoot: { newRoot: { $first: '$items' } } },
  ]
}
