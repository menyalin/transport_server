import PriceDTO from '../../dto/price.dto.js'
import { Tariff } from '../../models/index.js'
import getPointsTariffPipeline from './pipelines/getPointsTariffPipeline.js'

const getPointsTariff = async (params) => {
  const pipeline = getPointsTariffPipeline(params)
  const res = await Tariff.aggregate(pipeline)
  return res[0] || null
}

export default async (params) => {
  const tariff = await getPointsTariff(params)
  if (!tariff) return null
  return { ...PriceDTO.createFromTariff({ tariff, type: 'base' }) }
}
