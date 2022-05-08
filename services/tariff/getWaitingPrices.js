// import PriceDTO from '../../dto/price.dto.js'
import { Tariff } from '../../models/index.js'
import getWaitingTariffPipeline from './pipelines/getWaitingTariffPipeline.js'
import { AgreementService } from '../index.js'

const getDurationInHours = (
  point,
  { calcWaitingByArrivalDate, noWaitingPaymentForAreLate },
  { includeHours },
) => {
  let startDate
  const plannedDate = new Date(point.plannedDate)
  const arrivalDate = new Date(point.arrivalDate)
  const departureDate = new Date(point.departureDate)

  if (
    noWaitingPaymentForAreLate &&
    !!point.plannedDate &&
    arrivalDate > plannedDate
  )
    return 0

  if (
    !point.plannedDate ||
    calcWaitingByArrivalDate ||
    arrivalDate > plannedDate
  )
    startDate = arrivalDate
  else startDate = plannedDate
  const dur = (departureDate - startDate) / (1000 * 60 * 60)
  return dur > includeHours ? dur - includeHours : 0
}
const getRoundedMinutes = (minutes, roundBy) => {
  const roundByMinutes = roundBy * 60
  console.log('minutes', minutes - (minutes % roundByMinutes))
  return Math.floor(minutes - (minutes % roundByMinutes))
}

const getPrice = ({ durationInHours, tariff }) => {
  const durInMinutes = durationInHours * 60

  const costByMinute =
    tariff.price / (tariff.tariffBy === 'hour' ? 60 : 60 * 24)

  const costByMinuteWOVat =
    tariff.priceWOVat / (tariff.tariffBy === 'hour' ? 60 : 60 * 24)

  const sumVatInMinute =
    tariff.sumVat / (tariff.tariffBy === 'hour' ? 60 : 60 * 24)
  const roundedMinutes = getRoundedMinutes(durInMinutes, tariff.roundByHours)
  console.log(roundedMinutes)
  return {
    price: Math.round(costByMinute * roundedMinutes),
    priceWOVat: costByMinuteWOVat * roundedMinutes,
    sumVat: sumVatInMinute * roundedMinutes,
  }
}

const getWaitingTariff = async (params) => {
  const pipeline = getWaitingTariffPipeline(params)
  const res = await Tariff.aggregate(pipeline)
  return res[0] || null
}

export default async (order) => {
  const { route, agreement: agreementId } = order
  const completedPoints = route.filter((i) => i.arrivalDate && i.departureDate)

  if (completedPoints.length === 0) return null

  if (!agreementId) return null
  const agreement = await AgreementService.getById(agreementId)
  if (!agreement) return null

  const tariff = await getWaitingTariff(order)
  if (!tariff) return null
  const waitinginPoints = completedPoints.map((item) => {
    const waitingHours = getDurationInHours(item, agreement, tariff)

    return {
      type: item.type === 'loading' ? 'loadingDowntime' : 'unloadingDowntime',
      waitingHours,
      ...getPrice({ durationInHours: waitingHours, tariff }),
    }
  })

  console.log(' --> ', waitinginPoints)

  return []
}
