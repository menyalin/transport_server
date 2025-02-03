import { Order } from '@/domain/order/order.domain'
import { AgreementService } from '..'

export default async (order: Order) => {
  if (!order.orderDate || !order.clientId) return null
  const agreement = await AgreementService.getForOrder({
    company: order.company,
    client: order.clientId,
    date: order.orderDate,
    carrier: order.carrierId,
  })
  return agreement ? agreement._id.toString() : null
}
