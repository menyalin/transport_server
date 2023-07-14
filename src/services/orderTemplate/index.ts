// @ts-nocheck
import ChangeLogService from '../changeLog'
import { OrderTemplate } from '../../models'
import { emitTo } from '../../socket'
import IService from '../iService'

class OrderTemplateService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
  }

  async create({ body, user }) {
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
