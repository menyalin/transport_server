import { Partner } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import ChangeLogService from '../changeLog/index.js'

class DocumentService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
  }
}

export default new DocumentService({
  model: Partner,
  emitter: emitTo,
  modelName: 'partner',
  logService: ChangeLogService,
})
