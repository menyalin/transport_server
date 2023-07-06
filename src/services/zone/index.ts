// @ts-nocheck
import { Zone } from '../../models'
import { emitTo } from '../../socket'
import IService from '../iService'
import ChangeLogService from '../changeLog'

class Service extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
  }
}

export default new Service({
  model: Zone,
  emitter: emitTo,
  modelName: 'zone',
  logService: ChangeLogService,
})
