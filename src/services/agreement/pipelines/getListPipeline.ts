import { PipelineStage, Types } from 'mongoose'

interface IProps {
  company: string
  date?: string
  limit: string
  skip: string
  client?: string
  clientsOnly?: string
}

export default ({ company, limit, skip, client, clientsOnly }: IProps) => {
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
