import { Partner } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'

class PartnerService extends IService {
  constructor({ model, emitter, modelName }) {
    super({ model, emitter, modelName })
  }
}

export default new PartnerService({
  model: Partner,
  emitter: emitTo,
  modelName: 'partner'
})
