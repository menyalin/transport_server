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
}) => {
  const sP = new Date(startDate)
  const eP = new Date(endDate)

  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      $and: [{ date: { $gte: sP } }, { date: { $lt: eP } }],
    },
  }

  if (status === 'notPaid')
    firstMatcher.$match.$and.push(
      ...[{ isPaydByDriver: false }, { paymentDate: null }],
    )

  if (status === 'paid')
    firstMatcher.$match.$and.push({
      $or: [{ isPaydByDriver: true }, { paymentDate: { $ne: null } }],
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
  return [firstMatcher, ...group]
}
