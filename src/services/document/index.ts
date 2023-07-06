// @ts-nocheck
import { Document } from '../../models'
import { emitTo } from '../../socket'
import IService from '../iService'
import ChangeLogService from '../changeLog'

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
