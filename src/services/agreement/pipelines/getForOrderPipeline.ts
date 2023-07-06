// @ts-nocheck
import mongoose from 'mongoose'

export default ({ company, client, date, tkNameId }) => {
  const firstMatcher = {
    $match: {
      isActive: true,
      closed: { $ne: true },
      company: mongoose.Types.ObjectId(company),
      date: { $lt: new Date(date) },
    },
  }

  if (tkNameId)
    firstMatcher.$match.outsourceCarriers = mongoose.Types.ObjectId(tkNameId)
  else if (client) firstMatcher.$match.clients = mongoose.Types.ObjectId(client)
  return [firstMatcher, { $sort: { date: -1 } }, { $limit: 1 }]
}
