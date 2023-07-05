import ChangeLogService from '../changeLog/index.js'
import { Fine } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import { BadRequestError } from '../../helpers/errors.js'

import { getListPipeline } from './pipelines/getListPipeline.js'

class FineService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
  }

  async create({ body, user }) {
    const existedFine = await this.model
      .findOne({
        company: body.company,
        number: body.number,
      })
      .lean()

    if (existedFine)
      throw new BadRequestError(
        `Штраф с таким номером постановления уже есть! {${existedFine._id}}`
      )

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

  async getByNumber(number, companyId) {
    if (!number || !companyId)
      throw new BadRequestError(
        'fineService.getByNumber:  request params is missing!'
      )
    const fine = await this.model.findOne({ company: companyId, number }).lean()
    return fine
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

export default new FineService({
  model: Fine,
  emitter: emitTo,
  modelName: 'fine',
  logService: ChangeLogService,
})
