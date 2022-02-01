import ChangeLogService from '../changeLog/index.js'
import { Downtime } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'

import { getListSchedulePipeline } from './pipelines/getListSchedulePipeline.js'
import { getListPipeline } from './pipelines/getListPipeline.js'
import checkCrossItems from '../order/checkCrossItems.js'

class DowntimeService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
  }

  async create({ body, user }) {
    await checkCrossItems({ body })
    const data = await this.model.create(body)
    if (this.logService)
      await this.logService.add({
        docId: data._id.toString(),
        coll: this.modelName,
        opType: 'create',
        user,
        company: data.company.toString(),
        body: JSON.stringify(data.toJSON())
      })
    this.emitter(data.company.toString(), `${this.modelName}:created`, data)
    return data
  }

  async updateOne({ id, body, user }) {
    await checkCrossItems({ body, id })

    const data = await this.model.findByIdAndUpdate(id, body, { new: true })
    this.emitter(data.company.toString(), `${this.modelName}:updated`, data)
    if (this.logService)
      await this.logService.add({
        docId: data._id.toString(),
        coll: this.modelName,
        opType: 'update',
        user,
        company: data.company.toString(),
        body: JSON.stringify(data.toJSON())
      })
    return data
  }

  async getListForSchedule(params) {
    const pipeline = getListSchedulePipeline(params)
    const data = await this.model.aggregate(pipeline)
    return data
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

export default new DowntimeService({
  model: Downtime,
  emitter: emitTo,
  modelName: 'downtime',
  logService: ChangeLogService
})
