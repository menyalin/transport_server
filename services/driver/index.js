/* eslint-disable no-unused-vars */
import axios from 'axios'
import { Driver } from '../../models/index.js'

import { emitTo } from '../../socket/index.js'

class DriverService {
  async create(body) {
    let data = await Driver.create(body)
    data = await data.populate('tkName').execPopulate()
    emitTo(data.company.toString(), 'driver:created', data)
    return data
  }

  async updateOne(id, body) {
    const data = await Driver.findByIdAndUpdate(id, body, {
      new: true
    }).populate('tkName')
    emitTo(data.company.toString(), 'driver:updated', data)
    return data
  }

  async getByProfile(profile) {
    const data = await Driver.find({ company: profile }).populate('tkName')

    return data
  }

  async search({ search, profile }) {
    const query = { surname: new RegExp(search, 'i') }
    if (profile) query.company = profile
    const data = await Driver.find(query).populate('tkName').lean()
    return data
  }

  async getById(id) {
    const data = await Driver.findById(id).populate('tkName').lean()
    return data
  }

  async deleteById(id) {
    const data = await Driver.findByIdAndDelete(id)
    emitTo(data.company.toString(), 'driver:deleted', id)
    return data
  }
}

export default new DriverService()
