// @ts-nocheck
import { Document } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import ChangeLogService from '../changeLog/index.js'

class DocumentService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
  }
}

export default new DocumentService({
  model: Document,
  emitter: emitTo,
  modelName: 'document',
  logService: ChangeLogService,
})
