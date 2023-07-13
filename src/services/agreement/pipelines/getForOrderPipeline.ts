// @ts-nocheck
import mongoose from 'mongoose'

export default ({ company, client, date, tkNameId }) => {
  const firstMatcher = {
    $match: {
      isActive: true,
      closed: { $ne: true },
      company: new mongoose.Types.ObjectId(company),
      date: { $lt: new Date(date) },
    },
  }

  if (tkNameId)
    firstMatcher.$match.outsourceCarriers = new mongoose.Types.ObjectId(tkNameId)
  else if (client) firstMatcher.$match.clients = new mongoose.Types.ObjectId(client)
  return [firstMatcher, { $sort: { date: -1 } }, { $limit: 1 }]
}
