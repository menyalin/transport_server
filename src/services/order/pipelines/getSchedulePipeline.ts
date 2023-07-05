// @ts-nocheck
import mongoose from 'mongoose'

export const getSchedulePipeline = ({ company, startDate, endDate }) => {
  const sP = new Date(startDate)
  const eP = new Date(endDate)

  const firstDate = {
    $reduce: {
      input: '$route',
      initialValue: null,
      in: {
        $min: [
          '$$value',
          '$$this.plannedDate',
          '$$this.arrivalDate',
          '$$this.departureDate',
        ],
      },
    },
  }

  const lastDate = {
    $reduce: {
      input: '$route',
      initialValue: null,
      in: {
        $max: [
          '$$value',
          '$$this.plannedDate',
          '$$this.arrivalDate',
          '$$this.departureDate',
        ],
      },
    },
  }

  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      $expr: {
        $or: [
          {
            $and: [
              { $gt: [lastDate, sP] },
              { $lt: ['$startPositionDate', eP] },
            ],
          },
          { $and: [{ $gte: [firstDate, sP] }, { $lt: [firstDate, eP] }] },
        ],
      },
    },
  }
  return [firstMatcher]
}
