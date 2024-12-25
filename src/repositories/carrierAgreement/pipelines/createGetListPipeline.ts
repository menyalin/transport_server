import { search } from '@/controllers/tkName.controllers'
import { PipelineStage, Types } from 'mongoose'
import { z } from 'zod'

const propSchema = z.object({
  company: z.string(),
  limit: z.string().transform((v) => +v),
  skip: z.string().transform((v) => +v),
  search: z.string().optional(),
})

export const createGetListPipeline = (params: unknown): PipelineStage[] => {
  const p = propSchema.parse(params)

  const firstMatcher: PipelineStage.Match = {
    $match: {
      $expr: {
        $and: [
          { $eq: ['$company', new Types.ObjectId(p.company)] },
          { $eq: ['$isActive', true] },
        ],
      },
    },
  }

  if (p.search) {
    firstMatcher.$match?.$expr?.$and.push({
      $regexMatch: {
        input: { $concat: ['$name', ';', '$note'] },
        regex: p.search,
        options: 'i',
      },
    })
  }

  const finalFacet: PipelineStage.Facet = {
    $facet: {
      items: [{ $skip: p.skip }, { $limit: p.limit }],
      count: [{ $count: 'count' }],
    },
  }
  return [firstMatcher, finalFacet]
}
