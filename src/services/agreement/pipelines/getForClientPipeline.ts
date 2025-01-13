import z from 'zod'
import { PipelineStage, Types } from 'mongoose'

const propsSchema = z
  .object({
    company: z.string(),
    client: z.string().optional(),
    clients: z.array(z.string()).optional(),
    date: z.string().transform((v) => new Date(v)),
  })
  .refine((data) => data.client !== undefined || data.clients !== undefined, {
    message: 'Поле client или clients должно быть заполнено',
    path: ['client'],
  })

export default (props: unknown): PipelineStage[] => {
  const p = propsSchema.parse(props)

  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      // closed: { $ne: true }, //TODO: fix it
      company: new Types.ObjectId(p.company),
      date: { $lte: p.date },
      $expr: {
        $and: [],
      },
    },
  }
  if (p.client)
    firstMatcher.$match.$expr?.$and.push({
      $in: [new Types.ObjectId(p.client), '$clients'],
    })
  if (p.clients && p.clients.length)
    firstMatcher.$match.$expr?.$and.push({
      $or: p.clients.map((i) => ({ $in: [new Types.ObjectId(i), '$clients'] })),
    })

  return [
    firstMatcher,
    { $sort: { date: -1 } },
    { $group: { _id: '$_id', items: { $push: '$$ROOT' } } },
    { $replaceRoot: { newRoot: { $first: '$items' } } },
  ]
}
