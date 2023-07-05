// @ts-nocheck
import mongoose from 'mongoose'

export default ({
  company,
  date,
  agreement,
  truckKind,
  liftCapacity,
  route,
  analytics,
}) => {
  try {
    const orderDate = new Date(date)
    const firstPoint = route[0].address
    const firstMatcher = {
      $match: {
        isActive: true,
        company: mongoose.Types.ObjectId(company),
        agreement: mongoose.Types.ObjectId(agreement),
        type: 'directDistanceZones',
        date: { $lte: orderDate },
        truckKind: truckKind,
        liftCapacity: liftCapacity,
        loading: mongoose.Types.ObjectId(firstPoint),
        'zones.distance': { $gte: analytics.distanceDirect },
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
