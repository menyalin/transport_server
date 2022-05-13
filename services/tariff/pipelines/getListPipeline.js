import mongoose from 'mongoose'

export default ({
  company,
  date,
  limit,
  skip,
  agreement,
  client,
  type,
  document,
}) => {
  const groupByDate = []
  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
    },
  }
  if (type) firstMatcher.$match.type = type
  if (agreement)
    firstMatcher.$match.agreement = mongoose.Types.ObjectId(agreement)
  if (document)
    firstMatcher.$match.document = mongoose.Types.ObjectId(document)
  const agreementLookup = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'agreement',
        foreignField: '_id',
        as: 'agreement',
      },
    },
    { $addFields: { agreement: { $first: '$agreement' } } },
  ]
  if (client) {
    agreementLookup.push({
      $match: {
        'agreement.clients': mongoose.Types.ObjectId(client),
      },
    })
  }
  if (date) {
    firstMatcher.$match.date = { $lte: new Date(date) }
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

  const group = [
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
