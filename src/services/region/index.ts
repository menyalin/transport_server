// @ts-nocheck
import { Region } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import ChangeLogService from '../changeLog/index.js'

class Service extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
  }
}

export default new Service({
  model: Region,
  emitter: emitTo,
  modelName: 'region',
  logService: ChangeLogService,
})
