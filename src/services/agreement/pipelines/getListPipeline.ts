import { PipelineStage, Types } from 'mongoose'
import { z } from 'zod'

export default (props: unknown) => {
  const schemaProps = z.object({
    company: z.string(),
    executor: z.string().optional(),
    clients: z.array(z.string()).optional(),
    limit: z.string(),
    skip: z.string(),
    vatRate: z
      .string()
      .optional()
      .transform((i) => (i ? +i : undefined)),
    search: z.string().optional(),
  })
  const p = schemaProps.parse(props)
  const { company, clients, limit, skip, executor, vatRate } = p
  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      company: new Types.ObjectId(company),
      $expr: {
        $and: [{ $ne: ['$isOutsourceAgreement', true] }],
      },
    },
  }
  if (vatRate !== undefined)
    firstMatcher.$match.$expr?.$and.push({
      $eq: [vatRate, '$vatRate'],
    })

  if (clients && clients.length)
    firstMatcher.$match.$expr?.$and.push({
      $or: clients.map((clientId) => ({
        $in: [new Types.ObjectId(clientId), '$clients'],
      })),
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

  const clientLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'partners',
        localField: 'clients',
        foreignField: '_id',
        as: 'clientsName',
      },
    },
    {
      $addFields: {
        clientsName: {
          $map: {
            input: '$clientsName',
            as: 'item',
            in: {
              $getField: {
                input: '$$item',
                field: 'name',
              },
            },
          },
        },
      },
    },
  ]
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
  return [firstMatcher, ...carrierLookup, ...clientLookup, ...group]
}
