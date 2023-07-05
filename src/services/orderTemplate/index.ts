// @ts-nocheck
import ChangeLogService from '../changeLog/index.js'
import { OrderTemplate } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
// import getListPipeline from './pipelines/getListPipeline.js'

class OrderTemplateService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
  }

  async getList(params) {
    // const pipeline = getListPipeline(params)
    const res = await this.model
      .find({
        company: params.company,
        isActive: true
      })
      .lean()
    return res
  }
}

export default new OrderTemplateService({
  model: OrderTemplate,
  emitter: emitTo,
  modelName: 'orderTemplate',
  logService: ChangeLogService
})
