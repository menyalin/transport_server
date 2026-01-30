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
  currentOrder?: Order

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

    let tmpOrderCount = 0
    let tmpOrder: Order | undefined
    let tmpError: string | undefined

    try {
      let counter = 0
      for await (const orderDoc of this.ordersCursor) {
        const order = new Order(orderDoc, false)
        this.currentOrder = order
        await OrderService.refresh(order)
        this.ordersProcessed++

        // Освобождаем event loop каждые 5 заказов, чтобы cron задачи могли выполняться
        if (++counter % 5 === 0) {
          await new Promise((resolve) => setImmediate(resolve))
        }
      }
      this.currentOrder = undefined
    } catch (e) {
      this.error = e as Error
    } finally {
      // Сохраняем значения до сброса
      tmpOrderCount = this.ordersProcessed
      tmpOrder = this.currentOrder
      tmpError = this.error?.message

      // Сбрасываем состояние в finally
      this.error = undefined
      this.ordersProcessed = 0
      this.isOrdersProcessing = false
      this.ordersCount = 0
    }

    // Возвращаем результат после finally
    return {
      error: tmpError,
      order: tmpOrder,
      ordersCount: tmpOrderCount,
    }
  }
}

export default new MassUpdateService()
