// import axios from 'axios'
import { RouteSheet } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'

class RouteSheetService {
  async create(body, userId) {
    let data = await RouteSheet.create({ ...body, manager: userId || null })
    data = await data
      .populate('driver')
      .populate('driver2')
      .populate('truck')
      .populate('trailer')
      .populate('manager')
      .execPopulate()
    emitTo(data.company.toString(), 'routeSheet:created', data)
    return data
  }

  async updateOne(id, body, userId) {
    const data = await RouteSheet.findByIdAndUpdate(
      id,
      { ...body, manager: userId },
      { new: true }
    )
      .populate('truck')
      .populate('trailer')
      .populate('driver')
      .populate('driver2')
      .populate('manager')
    emitTo(data.company.toString(), 'routeSheet:updated', data)
    return data
  }

  async getByProfile(profile) {
    const data = await RouteSheet.find({ company: profile })
      .populate('driver')
      .populate('driver2')
      .populate('truck')
      .populate('trailer')
      .populate('manager')
    return data
  }

  async getById(id) {
    const data = await RouteSheet.findById(id)
      .populate('driver')
      .populate('driver2')
      .populate('truck')
      .populate('trailer')
      .populate('manager')
    return data
  }

  async deleteById(id) {
    const data = await RouteSheet.findByIdAndDelete(id)
    emitTo(data.company.toString(), 'routeSheet:deleted', id)
    return data
  }
}

export default new RouteSheetService()
