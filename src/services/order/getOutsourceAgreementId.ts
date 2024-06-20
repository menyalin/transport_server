//@ts-nocheck
import { Order } from '@/domain/order/order.domain'
import { AgreementService, TruckService } from '..'

export const getOutsourceAgreementId = async (
  order: Order
): Promise<string | null> => {
  try {
    if (!order.confirmedCrew.truck) return null

    const truck = await TruckService.getById(order.confirmedCrew.truck)
    if (!truck || !truck.tkName?.outsource) return null

    const agreement = await AgreementService.getForOrder({
      company: order.company,
      tkNameId: (truck?.tkName?._id as any).toString(),
      date: order.orderDate,
    })

    return agreement ? (agreement._id.toString() as string) : null
  } catch (e) {
    console.log('getOutsourceAgreementId error:', e)
    return null
  }
}
