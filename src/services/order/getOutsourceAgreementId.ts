// @ts-nocheck
import { AgreementService, TruckService } from '../index.js'

export default async (body) => {
  if (!body.route[0].plannedDate || !body.confirmedCrew.truck) return null
  const truck = await TruckService.getById(body.confirmedCrew.truck)
  if (!truck.tkName.outsource) return null

  const agreement = await AgreementService.getForOrder({
    company: body.company.toString(),
    tkNameId: truck?.tkName?._id.toString(),
    date: body.route[0].plannedDate,
  })
  return agreement ? agreement._id.toString() : null
}
