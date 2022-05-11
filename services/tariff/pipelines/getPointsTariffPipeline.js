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
        company: mongoose.Types.ObjectId(company),
        agreement: mongoose.Types.ObjectId(agreement),
        type: 'points',
        date: { $lte: orderDate },
        truckKind: truckKind,
        liftCapacity: liftCapacity,
        loading: mongoose.Types.ObjectId(firstPoint),
        unloading: mongoose.Types.ObjectId(lastPoint),
      },
    }
    return [firstMatcher, { $sort: { date: -1 } }, { $limit: 1 }]
  } catch (e) {
    throw new Error(e)
  }
}