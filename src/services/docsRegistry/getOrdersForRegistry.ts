// @ts-nocheck
import { getOrdersByDocsRegistryId } from './pipelines/getOrdersByDocsRegistryId'
import { OrderInDocsRegistry as OrderInDocsRegistryModel } from '../../models'

export default async function getOrdesForRegistry({
  docsRegistryId,
  orderIds,
}) {
  const orders = await OrderInDocsRegistryModel.aggregate(
    getOrdersByDocsRegistryId({ docsRegistryId, orderIds })
  )
  return orders
}
