import { ChangeLog } from '../../models/index.js'

class ChangeLogService {
  constructor({ model }) {
    this.model = model
  }

  async add({ company, user, coll, opType, body, docId }) {
    await this.model.create({ company, user, coll, opType, body, docId })
  }
}

export default new ChangeLogService({ model: ChangeLog })
