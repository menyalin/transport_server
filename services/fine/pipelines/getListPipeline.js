import mongoose from 'mongoose'

export const getListPipeline = ({
  startDate,
  endDate,
  company,
  limit,
  skip,
  status,
  truck,
  driver,
  category,
  sortBy,
  sortDesc,
  searchStr,
}) => {
  const sP = new Date(startDate)
  const eP = new Date(endDate)

  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      $expr: {
        $and: [{ $gte: ['$date', sP] }, { $lt: ['$date', eP] }],
      },
    },
  }

  if (status === 'notPaid')
    firstMatcher.$match.$expr.$and.push({
      $and: [
        { $eq: [{ $ifNull: ['$isPaydByDriver', false] }, false] },
        { $not: '$paymentDate' },
      ],
    })

  if (status === 'paid')
    firstMatcher.$match.$expr.$and.push({
      $or: [
        { $eq: ['$isPaydByDriver', true] },
        { $ne: ['$paymentDate', null] },
      ],
    })

  if (truck)
    firstMatcher.$match.$and.push({ truck: mongoose.Types.ObjectId(truck) })

  if (driver)
    firstMatcher.$match.$and.push({ driver: mongoose.Types.ObjectId(driver) })

  if (category) firstMatcher.$match.$and.push({ category })

  const sorting = (sortBy, sortDesc) => {
    const res = { $sort: {} }
    if (!sortBy || sortBy.length === 0)
      return {
        $sort: {
          date: 1,
        },
      }
    else
      sortBy.forEach((val, idx) => {
        res.$sort[val] = sortDesc[idx] === 'true' ? -1 : 1
      })
    return res
  }

  const group = [
    sorting(sortBy, sortDesc),
    {
      $group: {
        _id: 'fines',
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
  const workerLookup = [
    {
      $lookup: {
        from: 'workers',
        localField: 'payingByWorker',
        foreignField: '_id',
        as: '_worker',
      },
    },
    {
      $addFields: {
        _worker: { $first: '$_worker' },
      },
    },
  ]
  const pipeline = [firstMatcher, ...workerLookup]
  if (searchStr) {
    pipeline.push({
      $match: {
        $expr: {
          $or: [
            {
              $regexMatch: {
                input: '$number',
                regex: new RegExp(searchStr),
                options: 'i',
              },
            },
            {
              $regexMatch: {
                input: '$note',
                regex: new RegExp(searchStr),
                options: 'i',
              },
            },
            {
              $regexMatch: {
                input: '$_worker.name',
                regex: new RegExp(searchStr),
                options: 'i',
              },
            },
          ],
        },
      },
    })
  }

  return [...pipeline, ...group]
}
