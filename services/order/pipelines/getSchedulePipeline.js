import mongoose from 'mongoose'

export const getSchedulePipeline = ({ company, startDate, endDate }) => {
  const sP = new Date(startDate)
  const eP = new Date(endDate)

  const lastDate = {
    $reduce: {
      input: '$route',
      initialValue: null,
      in: {
        $max: [
          '$$value',
          '$$this.plannedDate',
          '$$this.arrivalDate',
          '$$this.departureDate'
        ]
      }
    }
  }

  const firstMatcher = {
    $match: {
      company: mongoose.Types.ObjectId(company),
      startPositionDate: { $lte: eP },
      $expr: { $gte: [lastDate, sP] }
    }
  }
  return [firstMatcher]
}
