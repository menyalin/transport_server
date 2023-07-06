// @ts-nocheck
import ChangeLogService from '../changeLog'
import { ScheduleNote } from '../../models'
import { emitTo } from '../../socket'
import IService from '../iService'

import { getListSchedulePipeline } from './pipelines/getListSchedulePipeline'
import { getListPipeline } from './pipelines/getListPipeline'

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
  logService: ChangeLogService,
})
