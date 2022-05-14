import PriceDTO from '../../dto/price.dto.js'
import { Tariff } from '../../models/index.js'
import getPointsTariffPipeline from './pipelines/getPointsTariffPipeline.js'
import getDistanceZonesPipeline from './pipelines/getDistanceZonesPipeline.js'

const getPointsTariff = async (params) => {
  const pipeline = getPointsTariffPipeline(params)
  const res = await Tariff.aggregate(pipeline)
  return res[0] || null
}

const getDirectDistanceZonesTariff = async (params) => {
  if (
    !params?.analytics?.distanceDirect ||
    isNaN(params?.analytics?.distanceDirect)
  )
    return null
  const pipeline = getDistanceZonesPipeline(params)
  const res = await Tariff.aggregate(pipeline)
  return res[0] || null
}

export default async (params) => {
  let tariff
  tariff = await getPointsTariff(params)
  if (tariff) return { ...PriceDTO.createFromTariff({ tariff, type: 'base' }) }

  tariff = await getDirectDistanceZonesTariff(params)
  if (tariff)
    return {
      ...new PriceDTO({
        type: 'base',
        ...tariff.zones.find(
          (i) => i.distance >= params.analytics.distanceDirect,
        ),
      }),
    }

  return null
}
