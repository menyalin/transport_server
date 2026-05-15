import { Order } from '@/domain/order/order.domain'
import { IPrintFormFileData } from '@/domain/printForm/interfaces'
import { OrderRepository } from '@/repositories'
import { commonOrderContractBuilder } from './common_order_contract/builder'
import { m2CherkizovoBuilder } from './m2_cherkizovo/builder'
import { IOrderPrintFormBuilder } from './interfaces'

interface IOrderPFBuilderProps {
  orderId: string
  templateName: string
}

export const orderPFBuilder = async ({
  orderId,
  templateName,
}: IOrderPFBuilderProps): Promise<IPrintFormFileData> => {
  const buildersMap = new Map<string, IOrderPrintFormBuilder>()

  buildersMap.set('common_order_contract', commonOrderContractBuilder)
  buildersMap.set('m2_cherkizovo', m2CherkizovoBuilder)

  if (!orderId || !templateName)
    throw new Error('orderPFBuilder : required args is missing')

  const order: Order = await OrderRepository.getById(orderId)
  if (!order) throw new Error('orderPFBuilder : required args is missing')

  let builder = buildersMap.get(templateName)
  if (!builder) throw new Error('orderPFBuilder : incorrect template name')

  return await builder(order)
}
