import mongoose from 'mongoose'

export default ({ company, date, agreement, truckKind, liftCapacity }) => {
  const orderDate = new Date(date)
  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      agreement: mongoose.Types.ObjectId(agreement),
      type: 'return',
      date: { $lte: orderDate },
      truckKind: truckKind,
      liftCapacity: liftCapacity,
    },
  }
  return [firstMatcher, { $sort: { date: -1, createdAt: -1 } }, { $limit: 1 }]
}
