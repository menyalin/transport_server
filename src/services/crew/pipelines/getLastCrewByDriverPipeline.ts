import { Types } from 'mongoose'
import { z } from 'zod'

export default (p: unknown) => {
  const schema = z.object({
    driver: z.string(),
    date: z.string().transform((v) => new Date(v)),
  })

  const params = schema.parse(p)

  const firstMatcher = {
    $match: {
      isActive: true,
      $expr: {
        $and: [
          { $eq: ['$driver', new Types.ObjectId(params.driver)] },
          { $gte: [params.date, '$startDate'] },
        ],
      },
    },
  }

  const sortByDate = {
    $sort: {
      startDate: -1,
    },
  }

  const addTransportObj = {
    $addFields: {
      transport: {
        $last: '$transport',
      },
    },
  }

  return [firstMatcher, sortByDate, { $limit: 1 }, addTransportObj]
}
