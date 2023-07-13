// @ts-nocheck
import { Region } from '../../models'
import { emitTo } from '../../socket'
import IService from '../iService'
import ChangeLogService from '../changeLog'

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
