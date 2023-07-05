// @ts-nocheck
/* eslint-disable no-unused-vars */
import { TkName } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import ChangeLogService from '../changeLog/index.js'

class TkNameService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
  }

  async search({ search, profile }) {
    const query = {
      isActive: true,
      surname: new RegExp(search, 'i'),
    }
    if (profile) query.company = profile
    const data = await this.model.find(query).lean()
    return data
  }
}

export default new TkNameService({
  model: TkName,
  emitter: emitTo,
  modelName: 'tkName',
  logService: ChangeLogService,
})
