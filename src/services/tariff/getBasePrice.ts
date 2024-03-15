// @ts-nocheck
import PriceDTO from '../../dto/price.dto'
import { Tariff, Address } from '../../models'
import getPointsTariffPipeline from './pipelines/getPointsTariffPipeline'
import getDistanceZonesPipeline from './pipelines/getDistanceZonesPipeline'
import getZonesTariffPipeline from './pipelines/getZonesTariffPipeline'

const getPointsTariff = async (params) => {
  const pipeline = getPointsTariffPipeline(params)
  const res = await Tariff.aggregate(pipeline)
  return res[0] || null
}

const getZonesTariff = async (params) => {
  const loadingAddressIds = params.route
    .filter((i) => i.type === 'loading')
    .map((i) => i.address)

  const unloadingAddressIds = params.route
    .filter((i) => i.type === 'unloading')
    .map((i) => i.address)

  const loadingAddresses = await Address.find({
    _id: loadingAddressIds,
  }).lean()

  const unloadingAddresses = await Address.find({
    _id: unloadingAddressIds,
  }).lean()

  const loadingZones = []
  const unloadingZones = []
  loadingAddresses
    .filter((i) => i.zones && i.zones.length)
    .forEach((i) => {
      loadingZones.push(...i.zones.map((z) => z.toString()))
    })

  unloadingAddresses
    .filter((i) => i.zones && i.zones.length)
    .forEach((i) => {
      unloadingZones.push(...i.zones.map((z) => z.toString()))
    })

  if (!loadingZones.length || !unloadingZones.length) return null
  const pipeline = getZonesTariffPipeline({
    ...params,
    loadingZones,
    unloadingZones,
  })
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

  tariff = await getZonesTariff(params)
  if (tariff) return { ...PriceDTO.createFromTariff({ tariff, type: 'base' }) }

  tariff = await getDirectDistanceZonesTariff(params)
  if (tariff)
    return {
      ...new PriceDTO({
        type: 'base',
        ...tariff.zones.find(
          (i) => i.distance >= params.analytics.distanceDirect
        ),
      }),
    }

  return null
}
