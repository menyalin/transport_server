import PriceDTO from '../../dto/price.dto.js'
import { Tariff } from '../../models/index.js'
import getAdditionalPointsTariffPipeline from './pipelines/getAdditionalPointsTariffPipeline.js'

export default async (order) => {
  // если есть аукционная цена, то доп.точки не считаем
  if (order.prices?.some((item) => item.type === 'base')) return null
  const pipeline = getAdditionalPointsTariffPipeline(order)
  const [tariff] = await Tariff.aggregate(pipeline)
  if (!tariff) return null
  const additionalPointsCount =
    order?.route.filter((i) => !i.isReturn).length - tariff.includedPoints || 0
  return {
    ...new PriceDTO({
      type: 'additionalPoints',
      priceWOVat: tariff.priceWOVat * additionalPointsCount,
      price: tariff.price * additionalPointsCount,
      sumVat: tariff.sumVat * additionalPointsCount,
    }),
  }
}
