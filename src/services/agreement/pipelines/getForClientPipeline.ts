import z from 'zod'
import { PipelineStage, Types } from 'mongoose'

const IPropsSchema = z
  .object({
    company: z.string(),
    client: z.string().optional(),
    clients: z.array(z.string()).optional(),
    date: z.date(),
  })
  .refine((data) => data.client !== undefined || data.clients !== undefined, {
    message: 'Поле client или clients должно быть заполнено',
    path: ['client'],
  })

type IProps = z.infer<typeof IPropsSchema>

export default (p: IProps): PipelineStage[] => {
  IPropsSchema.parse(p)
  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      closed: { $ne: true },
      company: new Types.ObjectId(p.company),
      date: { $lte: p.date },
      $expr: {
        $and: [],
      },
    },
  }
  if (p.client)
    firstMatcher.$match.$expr.$and.push({
      $in: [new Types.ObjectId(p.client), '$clients'],
    })
  if (p.clients && p.clients.length)
    firstMatcher.$match.$expr.$and.push({
      $or: p.clients.map((i) => ({ $in: [new Types.ObjectId(i), '$clients'] })),
    })

  return [
    firstMatcher,
    { $sort: { date: -1 } },
    { $group: { _id: '$executorName', items: { $push: '$$ROOT' } } },
    { $replaceRoot: { newRoot: { $first: '$items' } } },
  ]
}
