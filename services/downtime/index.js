import { Downtime } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'

class DowntimeService extends IService {
  constructor({ model, emitter, modelName }) {
    super({ model, emitter, modelName })
  }
}

export default new DowntimeService({
  model: Downtime,
  emitter: emitTo,
  modelName: 'downtime'
})
