import { CarrierRepository, VehicleRepository } from '@/repositories'

export const getOutsourceAgreementId = async (
  truckId: string
): Promise<string | null> => {
  try {
    if (!truckId) return null

    const truck = await VehicleRepository.getById(truckId)

    if (!truck) return null

    const carrier = await CarrierRepository.getById(truck.carrierId)

    return carrier?.agreement ?? null
  } catch (e) {
    console.log('getOutsourceAgreementId error:', e)
    return null
  }
}
