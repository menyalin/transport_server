import { Crew } from '../../models/index.js'

export default async ({ crew }) => {
  const lastTransportItem = crew.transport.pop()
  const lastDriverItem = await Crew.findOne({
    $not: { _id: crew._id },
    company: crew.company,
    driver: crew.driver._id,
    'transport.startDate': { $gt: lastTransportItem.startDate }
  }).lean()
  const lastTruckItem = await Crew.findOne({
    $not: { _id: crew._id },
    company: crew.company,
    transport: {
      $elemMatch: {
        truck: lastTransportItem.truck,
        startDate: { $gt: lastTransportItem.startDate }
      }
    }
  }).lean()
  let lastTrailerItem = null
  if (lastTransportItem.trailer)
    lastTrailerItem = await Crew.findOne({
      $not: { _id: crew._id },
      company: crew.company,
      transport: {
        $elemMatch: {
          truck: lastTransportItem.trailer,
          startDate: { $gt: lastTransportItem.startDate }
        }
      }
    }).lean()
  return !lastDriverItem && !lastTruckItem && !lastTrailerItem
}
