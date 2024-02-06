// @ts-nocheck
import ChangeLogService from '../changeLog'
import { Agreement } from '../../models'
import { emitTo } from '../../socket'
import IService from '../iService'
import getListPipeline from './pipelines/getListPipeline'
import getForOrderPipeline from './pipelines/getForOrderPipeline'
import getForClientPipeline from './pipelines/getForClientPipeline'

class AgreementService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
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
  model: Agreement,
  emitter: emitTo,
  modelName: 'agreement',
  logService: ChangeLogService,
})
