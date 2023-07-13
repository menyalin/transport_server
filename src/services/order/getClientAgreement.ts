// @ts-nocheck
import { AgreementService } from '..'

export default async (body) => {
  if (!body.route[0].plannedDate || !body.client.client) return null
  const agreement = await AgreementService.getForOrder({
    company: body.company,
    client: body.client.client,
    date: body.route[0].plannedDate,
  })
  return agreement ? agreement._id.toString() : null
}
