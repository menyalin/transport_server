import { PipelineStage, Types } from 'mongoose'
import { z } from 'zod'

export default (props: unknown) => {
  const schemaProps = z.object({
    company: z.string(),
    executor: z.string().optional(),
    client: z.string().optional(),
    limit: z.string(),
    skip: z.string(),
    search: z.string().optional(),
  })
  const p = schemaProps.parse(props)
  const { company, client, limit, skip, executor } = p
  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      company: new Types.ObjectId(company),
      $expr: {
        $and: [{ $ne: ['$isOutsourceAgreement', true] }],
      },
    },
  }

  if (client)
    firstMatcher.$match.$expr?.$and.push({
      $in: [new Types.ObjectId(client), '$clients'],
    })

  if (executor)
    firstMatcher.$match.$expr?.$and.push({
      $eq: [new Types.ObjectId(executor), '$executor'],
    })

  if (p.search)
    firstMatcher.$match.$expr?.$and.push({
      $regexMatch: {
        input: '$name',
        regex: p.search,
        options: 'i',
      },
    })
  const carrierLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'tknames',
        localField: 'executor',
        foreignField: '_id',
        as: '_carrier',
      },
    },
    {
      $addFields: {
        executorCarrierName: {
          $getField: {
            input: { $first: '$_carrier' },
            field: 'name',
          },
        },
      },
    },
    {
      $unset: ['_carrier'],
    },
  ]

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
  return [firstMatcher, ...carrierLookup, ...group]
}
