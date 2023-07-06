// @ts-nocheck
import ChangeLogService from '../changeLog'
import { OrderTemplate } from '../../models'
import { emitTo } from '../../socket'
import IService from '../iService'
// import getListPipeline from './pipelines/getListPipeline'

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
        isActive: true,
      })
      .lean()
    return res
  }
}

export default new OrderTemplateService({
  model: OrderTemplate,
  emitter: emitTo,
  modelName: 'orderTemplate',
  logService: ChangeLogService,
})
