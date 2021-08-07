/* eslint-disable no-unused-vars */
import { TkName } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'

class TkNameService {
  async create(body) {
    const data = await TkName.create(body)
    emitTo(data.company.toString(), 'tkName:created', data)
    return data
  }

  async updateOne(id, body) {
    const data = await TkName.findByIdAndUpdate(id, body, { new: true })
    emitTo(data.company.toString(), 'tkName:updated', data)
    return data
  }

  async getByProfile(profile) {
    const data = await TkName.find({ company: profile }).lean()
    return data
  }

  async search({ search, profile }) {
    const query = { surname: new RegExp(search, 'i') }
    if (profile) query.company = profile
    const data = await TkName.find(query).lean()
    return data
  }

  async getById(id) {
    const data = await TkName.findById(id).lean()
    return data
  }

  async deleteById(id) {
    const data = await TkName.findByIdAndDelete(id)
    emitTo(data.company.toString(), 'tkName:deleted', id)
    return data
  }
}

export default new TkNameService()
