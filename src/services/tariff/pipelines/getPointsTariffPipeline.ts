// @ts-nocheck
import mongoose from 'mongoose'

export default ({
  company,
  date,
  agreement,
  truckKind,
  liftCapacity,
  route,
}) => {
  try {
    const orderDate = new Date(date)
    const firstPoint = route[0].address
    const lastPoint = route.filter((i) => !i.isReturn).reverse()[0].address
    const firstMatcher = {
      $match: {
        isActive: true,
        company: new mongoose.Types.ObjectId(company),
        agreement: new mongoose.Types.ObjectId(agreement),
        type: 'points',
        date: { $lte: orderDate },
        truckKind: truckKind,
        liftCapacity: liftCapacity,
        loading: new mongoose.Types.ObjectId(firstPoint),
        unloading: new mongoose.Types.ObjectId(lastPoint),
      },
    }
    return [firstMatcher, { $sort: { date: -1, createdAt: -1 } }, { $limit: 1 }]
  } catch (e) {
    throw new Error(e)
  }
}
