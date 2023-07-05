import { getOrdersByDocsRegistryId } from './pipelines/getOrdersByDocsRegistryId.js'
import { OrderInDocsRegistry as OrderInDocsRegistryModel } from '../../models/index.js'

export default async function getOrdesForRegistry({
  docsRegistryId,
  orderIds,
}) {
  const orders = await OrderInDocsRegistryModel.aggregate(
    getOrdersByDocsRegistryId({ docsRegistryId, orderIds })
  )
  return orders
}
