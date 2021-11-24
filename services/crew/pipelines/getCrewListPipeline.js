import mongoose from 'mongoose'

export default ({ profile, limit, tkName, state, skip }) => {
  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(profile)
    }
  }
  if (tkName) firstMatcher.$match.tkName = mongoose.Types.ObjectId(tkName)
  if (state === 'active') firstMatcher.$match['transport.endDate'] = null
  return [firstMatcher, { $skip: +skip }, { $limit: +limit }]
}
