// @ts-nocheck
import mongoose from 'mongoose'

const pipeline = (userId) => {
  const matcher = {
    $match: {
      isActive: true,
      user: mongoose.Types.ObjectId(userId),
      accepted: true,
      disabled: false,
      pending: false,
    },
  }

  const lookup = [
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
      },
    },
    {
      $addFields: {
        company: { $first: '$company' },
      },
    },
  ]

  const project = {
    $project: {
      _id: '$company._id',
      name: '$company.name',
      fullName: '$company.fullName',
      inn: '$company.inn',
      settings: '$company.settings',
      roles: '$roles',
    },
  }

  return [matcher, ...lookup, project]
}

export default pipeline
