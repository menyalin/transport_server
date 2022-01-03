import mongoose from 'mongoose'

export const getListSchedulePipeline = ({ company, startDate, endDate }) => {
  // const sP = new Date(startDate)
  // const eP = new Date(endDate)
  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company)
      // startPositionDate: { $and: [$lt: eP },
    }
  }
  return [firstMatcher]
}
