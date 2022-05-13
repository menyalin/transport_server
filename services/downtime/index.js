import ChangeLogService from '../changeLog/index.js'
import { Downtime } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'

import { getListSchedulePipeline } from './pipelines/getListSchedulePipeline.js'
import { getListPipeline } from './pipelines/getListPipeline.js'
import checkCrossItems from '../order/checkCrossItems.js'
import { PermissionService } from '../index.js'

class DowntimeService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
  }

  async create({ body, user }) {
    await PermissionService.checkPeriod({
      userId: user,
      companyId: body.company,
      operation: 'downtime:daysForWrite',
      startDate: body.startPositionDate,
    })

    await checkCrossItems({ body })
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

  async updateOne({ id, body, user }) {
    await checkCrossItems({ body, id })
    let downtime = await this.model.findById(id)
    await PermissionService.checkPeriod({
      userId: user,
      companyId: body.company,
      operation: 'downtime:daysForWrite',
      startDate: downtime.endPositionDate,
    })
    downtime = Object.assign(downtime, body)
    await downtime.save()

    this.emitter(
      downtime.company.toString(),
      `${this.modelName}:updated`,
      downtime,
    )

    if (this.logService)
      await this.logService.add({
        docId: downtime._id.toString(),
        coll: this.modelName,
        opType: 'update',
        user,
        company: downtime.company.toString(),
        body: JSON.stringify(downtime.toJSON()),
      })
    return downtime
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

  async deleteById({ id, user }) {
    const data = await this.model.findById(id)
    await PermissionService.checkPeriod({
      userId: user,
      companyId: data.company.toString(),
      operation: 'downtime:daysForWrite',
      startDate: data.endPositionDate,
    })
    data.isActive = false
    await data.save()

    this.emitter(data.company.toString(), `${this.modelName}:deleted`, id)
    if (this.logService)
      await this.logService.add({
        docId: data._id.toString(),
        coll: this.modelName,
        opType: 'delete',
        user,
        company: data.company.toString(),
        body: JSON.stringify(data.toJSON()),
      })
    return data
  }
}

export default new DowntimeService({
  model: Downtime,
  emitter: emitTo,
  modelName: 'downtime',
  logService: ChangeLogService,
})
