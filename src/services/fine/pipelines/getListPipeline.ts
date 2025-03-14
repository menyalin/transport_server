// @ts-nocheck
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
  payingByWorker,
  needToWithheld,
}) => {
  const sP = new Date(startDate)
  const eP = new Date(endDate)
  const firstMatcher = {
    $match: {
      isActive: true,
      company: new mongoose.Types.ObjectId(company),
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

  if (truck) firstMatcher.$match.truck = new mongoose.Types.ObjectId(truck)

  if (driver) firstMatcher.$match.driver = new mongoose.Types.ObjectId(driver)

  if (payingByWorker && payingByWorker !== '__driver__')
    firstMatcher.$match.payingByWorker = new mongoose.Types.ObjectId(
      payingByWorker
    )

  if (payingByWorker && payingByWorker === '__driver__')
    firstMatcher.$match.isPaydByDriver = true

  if (category)
    firstMatcher.$match.$expr.$and.push({ $eq: ['$category', category] })

  if (needToWithheld === 'true')
    firstMatcher.$match.$expr.$and.push({ $gt: ['$withheldSum', 0] })

  const sorting = (sortBy, sortDesc) => {
    const res = { $sort: {} }
    if (!sortBy || sortBy.length === 0)
      return {
        $sort: { date: 1 },
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
        count: { $size: '$items' },
        analyticData: {
          count: { $size: '$items' },
          totalSum: {
            $reduce: {
              initialValue: 0,
              in: { $add: [{ $ifNull: ['$$this.totalSum', 0] }, '$$value'] },
              input: '$items',
            },
          },
          totalSumWithDiscount: {
            $reduce: {
              initialValue: 0,
              in: {
                $add: [{ $ifNull: ['$$this.discountedSum', 0] }, '$$value'],
              },
              input: '$items',
            },
          },
          totalPayed: {
            $reduce: {
              input: '$items',
              initialValue: 0,
              in: { $add: [{ $ifNull: ['$$this.paymentSum', 0] }, '$$value'] },
            },
          },
          needWithheld: {
            $reduce: {
              input: '$items',
              initialValue: 0,
              in: {
                $add: [{ $ifNull: ['$$this.withheldSum', 0] }, '$$value'],
              },
            },
          },
          isWithheld: {
            $reduce: {
              input: {
                $filter: {
                  input: '$items',
                  cond: {
                    $eq: ['$$this.isWithheld', true],
                  },
                },
              },
              initialValue: 0,
              in: { $add: [{ $ifNull: ['$$this.withheldSum', 0] }, '$$value'] },
            },
          },
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
