import { CarrierAgreement } from '@/domain/carrierAgreement'
import { ICarrierAgreementListData } from '@/domain/carrierAgreement/interfaces'
import { BadRequestError } from '@/helpers/errors'
import { CarrierAgreementRepository } from '@/repositories'
import { isValidObjectId } from 'mongoose'

class CarrierAgreementService {
  async create(data: unknown): Promise<CarrierAgreement> {
    return await CarrierAgreementRepository.create(data)
  }

  async getById(id: string): Promise<CarrierAgreement | null> {
    return await CarrierAgreementRepository.getById(id)
  }

  async getList(params: unknown): Promise<ICarrierAgreementListData> {
    return await CarrierAgreementRepository.getList(params)
  }

  async update(id: string, body: unknown): Promise<CarrierAgreement> {
    if (!id || !isValidObjectId(id))
      throw new BadRequestError('Invalid carrierAgreement id')

    const item = await CarrierAgreementRepository.getById(id)
    if (!item) throw new Error('CarrierAgreement not found')

    item.update(body)

    const res = await CarrierAgreementRepository.update(item)
    if (res) return res
    throw new Error('CarrierAgreement not found')
  }

  async deleteById(id: string): Promise<void> {
    await CarrierAgreementRepository.deleteById(id)
  }
}

export default new CarrierAgreementService()