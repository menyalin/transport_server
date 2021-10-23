import mongoose from 'mongoose'

export const getSchedulePipeline = ({ company, startDate, endDate }) => {
  const firstMatcher = {
    company: mongoose.Types.ObjectId(company)
  }

  const finalProject = {
    $project: {
      _id: '$_id',
      startPositionDate: '$startPositionDate',
      endPositionDate: '$endPositionDate'
    }
  }
  return [firstMatcher, finalProject]
}
