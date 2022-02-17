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
  return [firstMatcher, { $sort: { date: -1 } }, { $limit: 1 }]
}
