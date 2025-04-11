import { objectIdSchema } from '@/shared/validationSchemes'
import { Types } from 'mongoose'
import { z } from 'zod'

export default (p: unknown) => {
  const schema = z.object({
    driver: objectIdSchema,
  })

  const params = schema.parse(p)

  const firstMatcher = {
    $match: {
      isActive: true,
      $expr: {
        $and: [{ $eq: ['$driver', new Types.ObjectId(params.driver)] }],
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
