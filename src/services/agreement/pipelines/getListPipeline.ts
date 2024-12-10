import { PipelineStage, Types } from 'mongoose'
import { z } from 'zod'

export default (props: unknown) => {
  const schemaProps = z.object({
    company: z.string(),
    client: z.string().optional(),
    clientsOnly: z.string().optional(),
    limit: z.string(),
    skip: z.string(),
  })
  const p = schemaProps.parse(props)
  const { company, client, clientsOnly, limit, skip } = p
  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      company: new Types.ObjectId(company),
      $expr: {
        $and: [],
      },
    },
  }

  if (client)
    firstMatcher.$match.$expr?.$and.push({
      $in: [new Types.ObjectId(client), '$clients'],
    })

  if (clientsOnly === 'true')
    firstMatcher.$match.$expr?.$and.push({
      $eq: ['$isOutsourceAgreement', false],
    })

  const group: PipelineStage[] = [
    {
      $group: {
        _id: 'agreements',
        items: { $push: '$$ROOT' },
      },
    },
    {
      $addFields: {
        count: { $size: '$items' },
        items: { $slice: ['$items', +skip, +limit] },
      },
    },
  ]
  return [firstMatcher, ...group]
}
