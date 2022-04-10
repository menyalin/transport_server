import ChangeLogService from '../changeLog/index.js'
import { Tariff } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import getListPipeline from './pipelines/getListPipeline.js'

class TariffService extends IService {
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
}

export default new TariffService({
  model: Tariff,
  emitter: emitTo,
  modelName: 'tariff',
  logService: ChangeLogService,
})
