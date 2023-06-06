import mongoose from 'mongoose'
import { RouteStats } from '../../values/routeStats'

export class OrderStats {
  static getDbSchema() {
    return {
      orderId: mongoose.Types.ObjectId,
      route: RouteStats.getDbSchema(),
    }
  }
}
