// @ts-nocheck
import {
  DocsRegistry as DocsRegistryModel,
  OrderInDocsRegistry as OrderInDocsRegistryModel,
} from '../../models'

export const getDocsRegistryByOrderId = async (orderId) => {
  if (!orderId) throw new Error('getDocsRegistryByOrderId: orderId is required')

  const tmpItem = await OrderInDocsRegistryModel.findOne({
    order: orderId,
  }).lean()
  if (!tmpItem) return null

  const docsRegistry = await DocsRegistryModel.findOne({
    _id: tmpItem.docsRegistry.toString(),
  }).lean()

  return docsRegistry
}
