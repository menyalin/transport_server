import mongoose from 'mongoose'

export const getListPipeline = ({
  company,
  startDate,
  endDate,
  limit,
  skip
}) => {
  const sP = new Date(startDate)
  const eP = new Date(endDate)

  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      $and: [
        { startPositionDate: { $gte: sP } },
        { startPositionDate: { $lt: eP } }
      ]
    }
  }
  return [firstMatcher, { $skip: +skip }, { $limit: +limit }]
}
