import { Carrier } from '@/domain/carrier'
import { TkName as CarrierModel } from '../../models'
import { emitTo } from '../../socket'
import ChangeLogService from '../changeLog'
import { CarrierRepository } from '@/repositories'
import { BadRequestError } from '@/helpers/errors'

interface IProps {
  model: typeof CarrierModel
  emitter: typeof emitTo
  modelName: string
  logService: typeof ChangeLogService
}

class CarrierService {
  model: typeof CarrierModel
  emitter: typeof emitTo
  modelName: string
  logService: typeof ChangeLogService

  constructor({ model, emitter, modelName, logService }: IProps) {
    this.model = model
    this.logService = logService
    this.emitter = emitter
    this.modelName = modelName
  }

  async create({ body, user }: { body: unknown; user: string }) {
    const data = await this.model.create(body)
    if (this.logService)
      await this.logService.add({
        docId: data._id.toString(),
        coll: this.modelName,
        opType: 'create',
        user,
        company: data.company.toString(),
        body: JSON.stringify(data.toJSON()),
      })
    this.emitter(data.company.toString(), `${this.modelName}:created`, data)
    return data
  }

  async updateOne({ id, body, user }: { id: string; body: any; user: string }) {
    const existedCarrier = await CarrierRepository.getById(id)
    const newCarrier = new Carrier(body)

    if (!existedCarrier) throw new BadRequestError('Carrier not found')
    if (existedCarrier.version !== newCarrier.version)
      throw new BadRequestError('Carrier version mismatch')
    newCarrier.incVersion()
    await CarrierRepository.update(newCarrier)

    this.emitter(newCarrier.company, `${this.modelName}:updated`, newCarrier)

    await this.logService.add({
      docId: newCarrier._id,
      coll: this.modelName,
      opType: 'update',
      user,
      company: newCarrier.company,
      body: newCarrier,
    })
    return newCarrier
  }

  async getByProfile(profile: string) {
    const data = await this.model
      .find({ company: profile, isActive: true })
      .lean()
    return data
  }

  async getList(params: unknown) {
    return await CarrierRepository.getList(params)
  }

  async getById(id: string) {
    const data = await this.model.findById(id).lean()
    return data
  }

  async deleteById({ id, user }: { id: string; user: string }) {
    const data = await this.model.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )
    if (!data) throw new Error('Carrier not found')

    this.emitter(data.company.toString(), `${this.modelName}:deleted`, id)

    await this.logService.add({
      docId: data._id.toString(),
      coll: this.modelName,
      opType: 'delete',
      user,
      company: data.company.toString(),
      body: JSON.stringify(data.toJSON()),
    })
    return data
  }
}

export default new CarrierService({
  model: CarrierModel,
  emitter: emitTo,
  modelName: 'tkName',
  logService: ChangeLogService,
})
