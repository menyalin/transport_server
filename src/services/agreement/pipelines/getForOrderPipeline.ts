import mongoose, { PipelineStage } from 'mongoose'
import { z } from 'zod'

export default (p: unknown): PipelineStage[] => {
  const schemaProps = z.object({
    company: z.string(),
    client: z.string().optional(),
    date: z.string().transform((v) => new Date(v)),
    tkNameId: z.string().optional(),
    carrier: z.string().optional(),
  })

  const parsedProps = schemaProps.parse(p)

  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      closed: { $ne: true },
      company: new mongoose.Types.ObjectId(parsedProps.company),
      date: { $lt: new Date(parsedProps.date) },
    },
  }

  if (parsedProps.tkNameId)
    firstMatcher.$match.outsourceCarriers = new mongoose.Types.ObjectId(
      parsedProps.tkNameId
    )
  else if (parsedProps.client) {
    firstMatcher.$match.clients = new mongoose.Types.ObjectId(
      parsedProps.client
    )
    firstMatcher.$match.allowedCarriers = new mongoose.Types.ObjectId(
      parsedProps.carrier
    )
  }
  return [firstMatcher, { $sort: { date: -1 } }, { $limit: 1 }]
}
