// @ts-nocheck
import mongoose from 'mongoose'

export default ({
  company,
  date,
  agreement,
  truckKind,
  liftCapacity,
  orderType,
}) => {
  try {
    const orderDate = new Date(date)
    const firstMatcher = {
      $match: {
        isActive: true,
        company: mongoose.Types.ObjectId(company),
        agreement: mongoose.Types.ObjectId(agreement),
        type: 'waiting',
        date: { $lte: orderDate },
        truckKind: truckKind,
        liftCapacity: liftCapacity,
        orderType,
      },
    }
    return [
      firstMatcher,
      { $sort: { date: -1, createdAt: -1 } },
      { $limit: 1 },
    ]
  } catch (e) {
    throw new Error(e)
  }
}
