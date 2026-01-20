import { objectIdSchema } from '@/shared/validationSchemes'
import { PipelineStage, Types } from 'mongoose'
import z from 'zod'

export default (props: unknown) => {
  const propsSchema = z.object({
    period: z
      .array(z.string().datetime())
      .length(2)
      .transform((v) => v.map((i) => new Date(i))),
    profile: objectIdSchema,
    driver: objectIdSchema.optional(),
    tkName: objectIdSchema.optional(),
    truck: objectIdSchema.optional(),
    state: z.string().optional(),
    sortBy: z.string().optional(),
    skip: z.string().transform((v) => +v),
    limit: z.string().transform((v) => +v),
    sortDesc: z
      .string()
      .optional()
      .transform((v) => Boolean(v)),
  })

  const p = propsSchema.parse(props)

  let sortingField = 'startDate'
  let sortingDirection = p.sortDesc ? -1 : 1
  switch (p.sortBy) {
    case 'tkName':
      sortingField = 'tkName'
      break
    case 'driver':
      sortingField = 'driver'
      break
  }

  const carrierLookupFragmentBuilder = (): PipelineStage[] => [
    {
      $lookup: {
        from: 'tknames',
        localField: 'tkName',
        foreignField: '_id',
        as: '_carrier',
      },
    },
    { $addFields: { _carrier: { $first: '$_carrier' } } },
    {
      $addFields: {
        carrierName: {
          $getField: {
            field: 'name',
            input: '$_carrier',
          },
        },
      },
    },
    { $unset: ['_carrier'] },
  ]

  let firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      company: new Types.ObjectId(p.profile),
      $expr: {
        $and: [
          {
            $and: [
              { $lt: ['$startDate', p.period[1]] },
              {
                $or: [
                  { $eq: ['$endDate', null] },
                  { $gte: ['$endDate', p.period[0]] },
                ],
              },
            ],
          },
        ],
      },
    },
  }
  if (p.truck)
    firstMatcher.$match.$expr?.$and.push({
      $in: [new Types.ObjectId(p.truck), '$transport.truck'],
    })

  if (p.driver) firstMatcher.$match.driver = new Types.ObjectId(p.driver)
  if (p.tkName) firstMatcher.$match.tkName = new Types.ObjectId(p.tkName)
  if (p.state === 'active') firstMatcher.$match['transport.endDate'] = null
  if (p.state === 'inactive')
    firstMatcher.$match['transport.endDate'] = { $ne: null }

  const facet = [
    {
      $sort: {
        [sortingField]: sortingDirection,
      },
    },
    {
      $facet: {
        items: [
          { $skip: p.skip },
          { $limit: p.limit },
          ...carrierLookupFragmentBuilder(),
        ],
        count: [{ $count: 'total' }],
      },
    },
    {
      $project: {
        items: 1,
        count: {
          $arrayElemAt: ['$count.total', 0],
        },
      },
    },
  ]

  return [firstMatcher, ...facet]
}
