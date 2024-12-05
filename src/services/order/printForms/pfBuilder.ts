import { Order } from '@/domain/order/order.domain'
import { commonOrderContractBuilder } from './common_order_contract/builder'
import { OrderRepository } from '@/repositories'

interface IOrderPFBuilderProps {
  orderId: string
  templateName: string
}

export const orderPFBuilder = async ({
  orderId,
  templateName,
}: IOrderPFBuilderProps): Promise<Buffer> => {
  if (!orderId || !templateName)
    throw new Error('orderPFBuilder : required args is missing')
  const order: Order = await OrderRepository.getById(orderId)
  let builder = commonOrderContractBuilder
  return await builder(order)
}
