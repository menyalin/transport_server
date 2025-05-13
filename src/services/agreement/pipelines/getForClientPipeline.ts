import z from 'zod'
import { Expression, PipelineStage, Types } from 'mongoose'
import { objectIdSchema } from '@/shared/validationSchemes'

const propsSchema = z
  .object({
    company: z.string(),
    client: z.string().optional(),
    clients: z.array(z.string()).optional(),
    date: z.string().transform((v) => new Date(v)),
    currentAgreementId: objectIdSchema.optional(),
  })
  .refine((data) => data.client !== undefined || data.clients !== undefined, {
    message: 'Поле client или clients должно быть заполнено',
    path: ['client'],
  })

export default (props: unknown): PipelineStage[] => {
  const p = propsSchema.parse(props)

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
    ,
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
