import { CarrierRepository, VehicleRepository } from '@/repositories'
import { CrewService } from '..'

export const getOutsourceAgreementId = async (
  truckId: string,
  date: Date
): Promise<string | null> => {
  try {
    if (!truckId) return null
    const crew = await CrewService.getOneByTruckAndDate({
      truck: truckId,
      date,
    })
    if (!crew) return null
    const carrier = await CarrierRepository.getById(crew.tkName.toString())
    return carrier?.getAgreementIdtByDate(date) ?? null
  } catch (e) {
    console.log('getOutsourceAgreementId error:', e)
    return null
  }
}
