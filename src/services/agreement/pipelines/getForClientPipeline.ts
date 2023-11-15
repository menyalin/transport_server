import { PipelineStage, Types } from 'mongoose'
interface IProps {
  company: string
  client: string
  date: Date
}

export default ({ company, client, date }: IProps): PipelineStage[] => {
  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      closed: { $ne: true },
      company: new Types.ObjectId(company),
      date: { $lte: date },
      clients: new Types.ObjectId(client),
    },
  }

  return [
    firstMatcher,
    { $sort: { date: -1 } },
    { $group: { _id: '$executorName', items: { $push: '$$ROOT' } } },
    { $replaceRoot: { newRoot: { $first: '$items' } } },
  ]
}
