import ChangeLogService from '../changeLog/index.js'
import { ScheduleNote } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'

import { getListSchedulePipeline } from './pipelines/getListSchedulePipeline.js'
import { getListPipeline } from './pipelines/getListPipeline.js'

class ScheduleNoteService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
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

export default new ScheduleNoteService({
  model: ScheduleNote,
  emitter: emitTo,
  modelName: 'scheduleNote',
  logService: ChangeLogService
})