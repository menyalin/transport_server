import { CarrierAgreement } from '@/domain/carrierAgreement'
import { ICarrierAgreementListData } from '@/domain/carrierAgreement/interfaces'
import { BadRequestError } from '@/helpers/errors'
import { CarrierAgreementRepository, CarrierRepository } from '@/repositories'
import { objectIdSchema } from '@/shared/validationSchemes'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'

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

  async getAllowedAgreements(p: unknown): Promise<CarrierAgreement[]> {
    const paramsSchema = z.object({
      carrierId: objectIdSchema.transform((v) => v.toString()),
      date: z.string().transform((v) => new Date(v)),
      agreementId: z
        .string()
        .optional()
        .nullable()
        .transform((v) => {
          return v?.toString() || undefined
        }),
    })
    const params = paramsSchema.parse(p)

    const carrier = await CarrierRepository.getById(params.carrierId)
    if (!carrier) throw new Error('Carrier not found')

    const ids: string[] = carrier.getAgreementIdsByDate(params.date)
    if (params.agreementId) ids.push(params.agreementId)

    return await CarrierAgreementRepository.getByIds(ids)
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
