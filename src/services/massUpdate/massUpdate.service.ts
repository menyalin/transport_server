import { GetDocsCountProps } from '@/classes/getOrdersCountHandlerProps'
import { OrderRepository } from '@/repositories'
import { Cursor } from 'mongoose'
import { OrderService } from '..'
import { Order } from '@/domain/order/order.domain'

class MassUpdateService {
  isOrdersProcessing: boolean = false
  ordersCount: number = 0
  ordersProcessed: number = 0
  ordersCursor?: Cursor
  currentSettings?: GetDocsCountProps
  error?: Error

  async getOrdersCount(p: GetDocsCountProps): Promise<number> {
    const res = await OrderRepository.getOrdersCount(p)
    return res
  }

  async stopOrdersProcessing(): Promise<void> {
    this.ordersCursor?.close()
    this.isOrdersProcessing = false
  }

  ordersProcessingState() {
    return {
      isOrdersProcessing: this.isOrdersProcessing,
      totalCount: this.ordersCount,
      ordersProcessed: this.ordersProcessed,
      percent: Math.ceil((this.ordersProcessed / this.ordersCount) * 100),
      error: this.error,
    }
  }
  async cancelProcessing() {
    this.ordersCursor?.close()
  }

  async startOrderProcessing(p: GetDocsCountProps): Promise<any> {
    if (this.isOrdersProcessing) return
    this.isOrdersProcessing = true
    this.currentSettings = p
    this.ordersCount = await this.getOrdersCount(p)
    this.ordersCursor = OrderRepository.orderAggregationCursor(p)

    try {
      for await (const orderDoc of this.ordersCursor) {
        const order = new Order(orderDoc, false)
        await OrderService.refresh(order)
        this.ordersProcessed++
      }
    } catch (e) {
      this.error = e as Error
    } finally {
      const tmpOrderCount = this.ordersProcessed
      const tmpError = this.error?.message
      this.error = undefined
      this.ordersProcessed = 0
      this.isOrdersProcessing = false
      this.ordersCount = 0
      return {
        error: tmpError,
        ordersCount: tmpOrderCount,
      }
    }
  }
}

export default new MassUpdateService()
