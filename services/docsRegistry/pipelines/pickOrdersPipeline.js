import mongoose from 'mongoose'
import { BadRequestError } from '../../../helpers/errors.js'

export const getPickOrdersPipeline = ({ company, client }) => {
  if (!company)
    throw new BadRequestError('getPickOrdersPipeline: bad request params')
  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      $expr: {
        $and: [],
      },
    },
  }

  return [firstMatcher, { limit: 10 }]
}
