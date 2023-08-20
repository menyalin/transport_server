// @ts-nocheck
import { ChangeLog } from '../../models'

class ChangeLogService {
  constructor({ model }) {
    this.model = model
  }

  async add({ company, user, coll, opType, body, docId }) {
    await this.model.create({ company, user, coll, opType, body, docId })
  }

  async addArray({ array, user, coll, company, opType }) {
    await this.model.create(
      array.map((i) => ({
        docId: i._id.toString(),
        company,
        user,
        coll,
        body: JSON.stringify(i),
        opType,
      }))
    )
  }
}

export default new ChangeLogService({ model: ChangeLog })
