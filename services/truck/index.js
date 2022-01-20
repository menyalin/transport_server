/* eslint-disable no-unused-vars */
import { Truck } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import logService from '../changeLog/index.js'
import checkNotCompletedOrders from './checkNotCompletedOrders.js'
class TruckService {
  async create({ body, user }) {
    const data = await Truck.create(body)
    await logService.add({
      docId: data._id.toString(),
      coll: 'truck',
      user,
      opType: 'create',
      company: data.company.toString(),
      body: JSON.stringify(data.toJSON())
    })
    await data.populate('tkName')
    emitTo(data.company.toString(), 'truck:created', data)
    return data
  }

  async updateOne({ id, body, user }) {
    if (body.endServiceDate) await checkNotCompletedOrders({ truckId: id })
    const data = await Truck.findByIdAndUpdate(id, body, {
      new: true
    })
    await logService.add({
      docId: data._id.toString(),
      coll: 'truck',
      user,
      opType: 'update',
      company: data.company.toString(),
      body: JSON.stringify(data.toJSON())
    })
    await data.populate('tkName')
    emitTo(data.company.toString(), 'truck:updated', data)
    return data
  }

  async search({ search, type, profile }) {
    const query = {
      isActive: true,
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
    const data = await Truck.find({ company: profile, isActive: true })
      .populate('tkName')
      .lean()
    return data
  }

  async getById(id) {
    const data = await Truck.findById(id).populate('tkName').lean()
    return data
  }

  async deleteById({ id, user }) {
    const data = await Truck.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )
    await logService.add({
      docId: data._id.toString(),
      coll: 'truck',
      user,
      opType: 'delete',
      company: data.company.toString(),
      body: JSON.stringify(data.toJSON())
    })
    emitTo(data.company.toString(), 'truck:deleted', id)
    return data
  }
}

export default new TruckService()
