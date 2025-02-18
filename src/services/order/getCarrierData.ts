import { CarrierRepository } from '@/repositories'
import { CrewService } from '..'

interface ICarrierDataResult {
  outsourceAgreementId: string | null
  carrierId: string | null
}

export const getCarrierData = async (
  truckId: string,
  date: Date
): Promise<ICarrierDataResult> => {
  const emptyResult: ICarrierDataResult = {
    outsourceAgreementId: null,
    carrierId: null,
  }

  try {
    if (!truckId) return emptyResult
    const crew = await CrewService.getOneByTruckAndDate({
      truck: truckId,
      date,
    })
    if (!crew) return emptyResult
    const carrier = await CarrierRepository.getById(crew.tkName.toString())
    if (!carrier) return emptyResult

    return {
      outsourceAgreementId: carrier?.getAgreementIdtByDate(date) ?? null,
      carrierId: carrier?._id?.toString() ?? null,
    }
  } catch (e) {
    console.log('getOutsourceAgreementId error:', e)
    return emptyResult
  }
}
