// @ts-nocheck
import mongoose from 'mongoose'

export default ({ company, date, agreement, truckKind, liftCapacity }) => {
  const orderDate = new Date(date)
  const firstMatcher = {
    $match: {
      isActive: true,
      company: new mongoose.Types.ObjectId(company),
      agreement: new mongoose.Types.ObjectId(agreement),
      type: 'return',
      date: { $lte: orderDate },
      truckKind: truckKind,
      liftCapacity: liftCapacity,
    },
  }
  return [firstMatcher, { $sort: { date: -1, createdAt: -1 } }, { $limit: 1 }]
}
