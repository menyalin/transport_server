// @ts-nocheck
import { Crew } from '../../models'

export default async ({ crew }) => {
  const lastTransportItem = crew.transport.pop()
  const lastDriverItem = await Crew.findOne({
    _id: { $ne: crew._id },
    company: crew.company,
    driver: crew.driver._id,
    'transport.startDate': { $gt: lastTransportItem.startDate },
  }).lean()
  const lastTruckItem = await Crew.findOne({
    _id: { $ne: crew._id },
    company: crew.company,
    transport: {
      $elemMatch: {
        truck: lastTransportItem.truck,
        startDate: { $gt: lastTransportItem.startDate },
      },
    },
  }).lean()
  let lastTrailerItem = null
  if (lastTransportItem.trailer)
    lastTrailerItem = await Crew.findOne({
      _id: { $ne: crew._id },
      company: crew.company,
      transport: {
        $elemMatch: {
          truck: lastTransportItem.trailer,
          startDate: { $gt: lastTransportItem.startDate },
        },
      },
    }).lean()
  return !lastDriverItem && !lastTruckItem && !lastTrailerItem
}
