import ChangeLogService from '../changeLog/index.js'
import { Agreement } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import getListPipeline from './pipelines/getListPipeline.js'
import getForOrderPipeline from './pipelines/getForOrderPipeline.js'

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
}

export default new AgreementService({
  model: Agreement,
  emitter: emitTo,
  modelName: 'agreement',
  logService: ChangeLogService
})
