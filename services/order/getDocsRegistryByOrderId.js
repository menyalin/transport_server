import {
  DocsRegistry as DocsRegistryModel,
  OrderInDocsRegistry as OrderInDocsRegistryModel,
} from '../../models/index.js'

export const getDocsRegistryByOrderId = async (orderId) => {
  if (!orderId) throw new Error('getDocsRegistryByOrderId: orderId is required')

  const tmpItem = await OrderInDocsRegistryModel.findOne({
    order: orderId,
  }).lean()

  const docsRegistry = await DocsRegistryModel.findOne({
    _id: tmpItem.docsRegistry.toString(),
  }).lean()

  return docsRegistry
}
