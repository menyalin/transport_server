/* eslint-disable no-unused-vars */

import { Truck } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'

class TruckService {
  async create(body) {
    let data = await Truck.create(body)
    data = await data.populate('tkName').execPopulate()
    emitTo(data.company.toString(), 'truck:created', data)
    return data
  }

  async updateOne(id, body) {
    const data = await Truck.findByIdAndUpdate(id, body, {
      new: true
    }).populate('tkName')
    emitTo(data.company.toString(), 'truck:updated', data)
    return data
  }

  async search({ search, type, profile }) {
    const query = {
      $or: [
        { name: new RegExp(search, 'i') },
        { regNum: new RegExp(search, 'i') }
      ]
    }
    if (profile) query.company = profile
    if (type) query.type = type
    const data = await Truck.find(query).populate('tkName').lean()
    return data
  }

  async getByProfile(profile) {
    const data = await Truck.find({ company: profile })
      .populate('tkName')
      .lean()
    return data
  }

  async getById(id) {
    const data = await Truck.findById(id).populate('tkName').lean()
    return data
  }

  async deleteById(id) {
    const data = await Truck.findByIdAndDelete(id)
    emitTo(data.company.toString(), 'truck:deleted', id)
    return data
  }
}

export default new TruckService()
