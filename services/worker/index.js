import { Worker } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import ChangeLogService from '../changeLog/index.js'

class WorkerService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
  }
}

export default new WorkerService({
  model: Worker,
  emitter: emitTo,
  modelName: 'worker',
  logService: ChangeLogService,
})
