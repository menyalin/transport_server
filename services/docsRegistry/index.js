import mongoose from 'mongoose'
import ChangeLogService from '../changeLog/index.js'
import { DocsRegistry as DocsRegistryModel } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import { BadRequestError } from '../../helpers/errors.js'
import { getListPipeline } from './pipelines/getListPipeline.js'

class DocsRegistryService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
  }

  async create({ body, user, company }) {
    if (!company) throw new BadRequestError('bad request params')
    const lastRegistry = await this.model.aggregate([
      { $match: { company: mongoose.Types.ObjectId(company) } },
      { $project: { number: '$number' } },
      { $sort: { number: -1 } },
      { $limit: 1 },
    ])

    if (!lastRegistry[0] || !lastRegistry[0].number) body.number = 1
    else body.number = lastRegistry[0].number + 1

    const data = await this.model.create({ ...body, company })

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
    try {
      const pipeline = getListPipeline(params)
      const res = await this.model.aggregate(pipeline)
      return res[0] || []
    } catch (e) {
      throw new Error(e.message)
    }
  }
}

export default new DocsRegistryService({
  model: DocsRegistryModel,
  emitter: emitTo,
  modelName: 'docsRegistry',
  logService: ChangeLogService,
})
