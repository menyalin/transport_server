import { Order } from '../../models/index.js'
import { BadRequestError } from '../../helpers/errors.js'

export default async function ({ truckId }) {
  const data = await Order.findOne({
    isActive: true,
    'confirmedCrew.truck': truckId,
    'state.status': { $ne: 'confirmed' }
  }).lean()
  if (data)
    throw new BadRequestError('у данного ТС имеются не выполненные рейсы')
  else return null
}
