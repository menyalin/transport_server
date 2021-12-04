import { Partner } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import ChangeLogService  from '../changeLog/index.js'

class PartnerService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
  }
}

export default new PartnerService({
  model: Partner,
  emitter: emitTo,
  modelName: 'partner',
  logService: ChangeLogService
})
