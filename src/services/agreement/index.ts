// @ts-nocheck
import ChangeLogService from '../changeLog'
import { Agreement as AgreementModel } from '../../models'
import { emitTo } from '../../socket'
import IService from '../iService'
import getListPipeline from './pipelines/getListPipeline'
import getForOrderPipeline from './pipelines/getForOrderPipeline'
import getForClientPipeline from './pipelines/getForClientPipeline'
import { Agreement as AgreementDomain } from '@/domain/agreement/agreement.domain'
import { TtlMap } from '@/utils/ttlMap'

class AgreementService extends IService {
  model: typeof AgreementModel
  logService: typeof ChangeLogService
  agreementsMap: TtlMap<string, AgreementDomain>

  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
    this.agreementsMap = new TtlMap<string, AgreementDomain>(1000 * 60 * 5)
  }

  async getList(params) {
    try {
      const pipeline = getListPipeline(params)
      const res = await this.model.aggregate(pipeline)
      return res[0]
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async getById(id: string): Promise<Agreement | null> {
    if (this.agreementsMap.has(id)) return this.agreementsMap.get(id)

    const data = await this.model.findById(id).lean()
    if (!data) return null
    const agreement = new AgreementDomain(data)
    this.agreementsMap.set(id, agreement)
    return agreement
  }

  async getForOrder(params) {
    try {
      const pipeline = getForOrderPipeline(params)
      const res = await this.model.aggregate(pipeline)
      return res.length ? res[0] : null
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async getForClient(props: {
    client?: string
    clients?: string[]
    company: string
    date: Date
  }): any[] {
    const pipeline = getForClientPipeline(props)
    const res = await this.model.aggregate(pipeline)
    return res
  }
}

export default new AgreementService({
  model: AgreementModel,
  emitter: emitTo,
  modelName: 'agreement',
  logService: ChangeLogService,
})
