import PriceDTO from '../../dto/price.dto.js'
import { Tariff } from '../../models/index.js'
import getAdditionalPointsTariffPipeline from './pipelines/getAdditionalPointsTariffPipeline.js'

export default async (params) => {
  const pipeline = getAdditionalPointsTariffPipeline(params)
  const [tariff] = await Tariff.aggregate(pipeline)
  if (!tariff) return null
  const additionalPointsCount =
    params?.route.filter((i) => !i.isReturn).length - tariff.includedPoints ||
    0
  return {
    ...new PriceDTO({
      type: 'additionalPoints',
      priceWOVat: tariff.priceWOVat * additionalPointsCount,
      price: tariff.price * additionalPointsCount,
      sumVat: tariff.sumVat * additionalPointsCount,
    }),
  }
}
