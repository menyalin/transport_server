import { Order } from '@/domain/order/order.domain'
import { IPrintFormFileData } from '@/domain/printForm/interfaces'

export interface IOrderPrintFormBuilder {
  (order: Order): Promise<IPrintFormFileData>
}
