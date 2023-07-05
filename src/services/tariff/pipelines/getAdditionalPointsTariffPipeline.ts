import mongoose from 'mongoose'
import { ORDER_ANALYTIC_TYPES_ENUM } from '../../../constants/order.js'
import { BadRequestError } from '../../../helpers/errors.js'

export default ({
  company,
  date,
  agreement,
  truckKind,
  liftCapacity,
  orderType,
  route,
}) => {
  if (!orderType || !ORDER_ANALYTIC_TYPES_ENUM.includes(orderType))
    throw new BadRequestError(
      `orderType is undefinded, please set correct order type! ${orderType}`,
    )

  const orderDate = new Date(date)
  const pointsInRoute = route.filter((i) => !i.isReturn).length
  const firstMatcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      agreement: mongoose.Types.ObjectId(agreement),
      type: 'additionalPoints',
      date: { $lte: orderDate },
      truckKind: truckKind,
      liftCapacity: liftCapacity,
      orderType,
      includedPoints: { $lt: pointsInRoute },
    },
  }
  return [firstMatcher, { $sort: { date: -1, createdAt: -1 } }, { $limit: 1 }]
}
