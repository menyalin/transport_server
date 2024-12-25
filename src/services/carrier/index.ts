import { TkName as CarrierModel } from '../../models'
import { emitTo } from '../../socket'
import ChangeLogService from '../changeLog'
import { CarrierRepository } from '@/repositories'

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
    const data = await this.model.findByIdAndUpdate(id, body, { new: true })
    if (!data) throw new Error('Carrier not found')

    this.emitter(data.company.toString(), `${this.modelName}:updated`, data)

    await this.logService.add({
      docId: data._id.toString(),
      coll: this.modelName,
      opType: 'update',
      user,
      company: data.company.toString(),
      body: JSON.stringify(data.toJSON()),
    })
    return data
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
