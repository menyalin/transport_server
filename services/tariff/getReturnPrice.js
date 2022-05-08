import PriceDTO from '../../dto/price.dto.js'
import { Tariff } from '../../models/index.js'
import getReturnTariffPipeline from './pipelines/getReturnTariffPipeline.js'

export const getReturnTariff = async (params) => {
  const pipeline = getReturnTariffPipeline(params)
  const [tariff] = await Tariff.aggregate(pipeline)
  return tariff || null
}

export default async (params, basePrice) => {
  const isExistReturn = params.route.some((item) => item.isReturn)
  if (!isExistReturn) return null
  const tariff = await getReturnTariff(params)
  if (!tariff) return null
  return {
    ...new PriceDTO({
      type: 'return',
      priceWOVat: basePrice.priceWOVat * (tariff.percentOfTariff / 100),
      price: basePrice.price * (tariff.percentOfTariff / 100),
      sumVat: basePrice.sumVat * (tariff.percentOfTariff / 100),
    }),
  }
}
