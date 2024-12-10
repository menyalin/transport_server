import { PipelineStage } from 'mongoose'
import ChangeLogService from '../changeLog'
import { Agreement as AgreementModel } from '../../models'
import { emitTo } from '../../socket'
import getListPipeline from './pipelines/getListPipeline'
import getForOrderPipeline from './pipelines/getForOrderPipeline'
import getForClientPipeline from './pipelines/getForClientPipeline'
import {
  Agreement,
  Agreement as AgreementDomain,
} from '@/domain/agreement/agreement.domain'
import { TtlMap } from '@/utils/ttlMap'

interface IConstructorProps {
  model: typeof AgreementModel
  emitter: typeof emitTo
  modelName: string
  logService: typeof ChangeLogService
}

class AgreementService {
  model: typeof AgreementModel
  logService: typeof ChangeLogService
  agreementsMap: TtlMap<string, AgreementDomain>
  emitter: typeof emitTo
  modelName: string

  constructor({ model, emitter, modelName, logService }: IConstructorProps) {
    this.emitter = emitter
    this.model = model
    this.modelName = modelName
    this.logService = logService
    this.agreementsMap = new TtlMap<string, AgreementDomain>(1000 * 60 * 5)
  }

  async getList(params: unknown) {
    const pipeline = getListPipeline(params)
    const res = await this.model.aggregate(pipeline)
    return res[0]
  }

  async getById(id: string): Promise<Agreement | null> {
    if (this.agreementsMap.has(id)) return this.agreementsMap.get(id) ?? null

    const data = await this.model.findById(id).lean()
    if (!data) return null
    const agreement = new AgreementDomain(data)
    this.agreementsMap.set(id, agreement)
    return agreement
  }

  async getForOrder(params: unknown) {
    const pipeline: PipelineStage[] = getForOrderPipeline(params)
    const res = await this.model.aggregate(pipeline)
    return res.length ? res[0] : null
  }

  async getForClient(props: unknown): Promise<unknown[]> {
    const pipeline = getForClientPipeline(props)
    const res = await this.model.aggregate(pipeline)
    return res
  }

  async create({ body, user }: { body: any; user: string }) {
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
    if (!data) throw new Error('Agreement not found')
    this.emitter(data.company.toString(), `${this.modelName}:updated`, data)
    if (this.logService)
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

  async deleteById({ id, user }: { id: string; user: string }) {
    const data = await this.model.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )
    if (!data) throw new Error('Agreement not found')
    this.emitter(data.company.toString(), `${this.modelName}:deleted`, id)
    if (this.logService)
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

export default new AgreementService({
  model: AgreementModel,
  emitter: emitTo,
  modelName: 'agreement',
  logService: ChangeLogService,
})
