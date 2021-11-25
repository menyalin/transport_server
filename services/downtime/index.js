import { Downtime } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import { getListSchedulePipeline } from './pipelines/getListSchedulePipeline.js'
import { getListPipeline } from './pipelines/getListPipeline.js'

class DowntimeService extends IService {
  constructor({ model, emitter, modelName }) {
    super({ model, emitter, modelName })
    this.model = model
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
      return res
    } catch (e) {
      throw new Error(e.message)
    }
  }
}

export default new DowntimeService({
  model: Downtime,
  emitter: emitTo,
  modelName: 'downtime'
})
