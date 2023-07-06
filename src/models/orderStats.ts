// @ts-nocheck
import mongoose from 'mongoose'
import { OrderStats } from '../domain/order/orderStats'

const schema = new mongoose.Schema(OrderStats.getDbSchema(), {
  timestamps: true,
})

export default mongoose.model('OrderStats', schema, 'orderStats')
