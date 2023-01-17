import mongoose from 'mongoose'
import { BadRequestError } from '../../../helpers/errors.js'

export const getPickOrdersPipeline = ({
  company,
  client,
  allowedLoadingPoints,
}) => {
  if (!company || !client)
    throw new BadRequestError('getPickOrdersPipeline: bad request params')

  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      client: mongoose.Types.ObjectId(client),
      $expr: {
        $and: [],
      },
    },
  }

  return [firstMatcher, { limit: 10 }]
}
