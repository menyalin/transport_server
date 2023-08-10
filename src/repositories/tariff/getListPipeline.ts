import mongoose, { PipelineStage } from 'mongoose'
interface IProps {
  company: string
  date?: Date
  limit: number
  skip: number
  agreement?: string
  client?: string
  type?: string
  document?: string
}

export default ({
  company,
  date,
  limit,
  skip,
  agreement,
  client,
  type,
  document,
}: IProps): PipelineStage[] => {
  const groupByDate: PipelineStage[] = []
  const firstMatcher: PipelineStage = {
    $match: {
      isActive: true,
      company: new mongoose.Types.ObjectId(company),
    },
  }
  if (type) firstMatcher.$match.type = type
  if (agreement)
    firstMatcher.$match.agreement = new mongoose.Types.ObjectId(agreement)
  if (document)
    firstMatcher.$match.document = new mongoose.Types.ObjectId(document)
  const agreementLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'agreement',
        foreignField: '_id',
        as: '_agreement',
      },
    },
    { $addFields: { _agreement: { $first: '$_agreement' } } },
    { $addFields: { agreementName: '$_agreement.name' } },
  ]

  if (client) {
    agreementLookup.push({
      $match: {
        '_agreement.clients': new mongoose.Types.ObjectId(client),
      },
    })
  }
  if (date) {
    firstMatcher.$match.date = { $lte: date }
    groupByDate.push({
      $sort: { date: 1, createdAt: 1 },
    })

    groupByDate.push({
      $group: {
        _id: {
          type: '$type',
          truckKind: '$truckKind',
          liftCapacity: '$liftCapacity',
          loading: '$loading',
          unloading: '$unloading',
          loadingZone: '$loadingZone',
          unloadingZone: '$unloadingZone',
          orderType: '$orderType',
        },
        tariff: { $last: '$$ROOT' },
      },
    })

    groupByDate.push({
      $replaceRoot: {
        newRoot: '$tariff',
      },
    })
  }

  const group: PipelineStage[] = [
    {
      $group: {
        _id: 'tariffs',
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
          $slice: ['$items', +skip, +limit],
        },
      },
    },
  ]
  const pipeline = [firstMatcher, ...agreementLookup]
  if (date) pipeline.push(...groupByDate)
  return [...pipeline, ...group]
}
