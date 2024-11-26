import { commonOrderContractBuilder } from './common_order_contract/builder'

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
  let builder = commonOrderContractBuilder
  return await builder()
}
