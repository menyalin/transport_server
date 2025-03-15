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
  let sortingDirection = -1
  switch (p.sortBy) {
    case 'tkName':
      sortingField = 'tkName'
      sortingDirection = p.sortDesc ? -1 : 1
      break
    case 'driver':
      sortingField = 'driver'
      sortingDirection = p.sortDesc ? -1 : 1
      break
    case 'startDate':
      sortingField = 'startDate'
      sortingDirection = p.sortDesc ? -1 : 1
      break
  }

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

  const group = [
    {
      $sort: {
        [sortingField]: sortingDirection,
      },
    },
    {
      $group: {
        _id: 'crews',
        items: {
          $push: '$$ROOT',
        },
      },
    },
    {
      $addFields: {
        count: {
          $size: '$items',
        },
        items: {
          $slice: ['$items', p.skip, p.limit],
        },
      },
    },
  ]

  return [firstMatcher, ...group]
}
