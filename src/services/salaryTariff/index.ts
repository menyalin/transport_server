// @ts-nocheck
import ChangeLogService from '../changeLog'
import { SalaryTariff, Order as OrderModel } from '../../models'
import { emitTo } from '../../socket'
import IService from '../iService'
import getListPipeline from './pipelines/getListPipeline'
import getDriverSalaryByPeriodPipeline from './pipelines/getDriverSalaryByPeriodPipeline'

class SalaryTariffService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
  }

  async create({ body, user, company }) {
    try {
      const data = await this.model.create(body)
      if (Array.isArray(data)) {
        await this.logService.addArray({
          array: data,
          coll: this.modelName,
          opType: 'create',
          user,
          company,
        })
      } else
        await this.logService.add({
          docId: data._id.toString(),
          coll: this.modelName,
          opType: 'create',
          user,
          company: data.company.toString(),
          body: JSON.stringify(data.toJSON()),
        })

      return data
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async updateOne({ id, body, user }) {
    const data = await this.model.findByIdAndUpdate(id, body, { new: true })
    if (this.logService)
      await this.logService.add({
        docId: data._id.toString(),
        coll: this.modelName,
        opType: 'update',
        user,
        company: data.company.toString(),
        body: JSON.stringify(data.toJSON()),
      })
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

  async getDriversSalaryByPeriod(params) {
    try {
      const pipeline = getDriverSalaryByPeriodPipeline(params)
      const res = await OrderModel.aggregate(pipeline)
      return res
    } catch (e) {
      throw new Error(e.message)
    }
  }
}

export default new SalaryTariffService({
  model: SalaryTariff,
  emitter: emitTo,
  modelName: 'salaryTariff',
  logService: ChangeLogService,
})
