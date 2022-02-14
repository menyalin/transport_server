import mongoose from 'mongoose'
// required: ['company', 'date', 'client'],

export default ({ company, client, date }) => {
  const firstMatcher = {
    $match: {
      isActive: true,
      closed: { $ne: true },
      company: mongoose.Types.ObjectId(company),
      clients: mongoose.Types.ObjectId(client),
      date: { $lt: new Date(date) }
    }
  }
  const addField = {
    $addFields: {
      type: {
        $cond: {
          if: '$useByDefault',
          then: 'default',
          else: '$calcMethod'
        }
      }
    }
  }
  const groupByType = {
    $group: {
      _id: '$type',
      agreements: {
        $push: '$$ROOT'
      }
    }
  }
  const getLastAgreement = {
    $project: {
      agreement: {
        $last: '$agreements'
      }
    }
  }

  const lastProject = {
    $project: {
      _id: '$agreement._id',
      type: '$_id',
      name: '$agreement.name',
      vatRate: '$agreement.vatRate',
      calcMethod: '$agreement.calcMethod'
    }
  }

  return [firstMatcher, addField, groupByType, getLastAgreement, lastProject]
}
