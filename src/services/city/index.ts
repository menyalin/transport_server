// @ts-nocheck
import { City } from '../../models'
import { emitTo } from '../../socket'
import IService from '../iService'
import ChangeLogService from '../changeLog'

class Service extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
  }
}

export default new Service({
  model: City,
  emitter: emitTo,
  modelName: 'city',
  logService: ChangeLogService,
})
