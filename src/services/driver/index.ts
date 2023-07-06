// @ts-nocheck
/* eslint-disable no-unused-vars */
import { Driver } from '../../models'

import { emitTo } from '../../socket'
import { ChangeLogService } from '..'

class DriverService {
  async create({ body, user }) {
    const data = await Driver.create(body)
    await ChangeLogService.add({
      docId: data._id.toString(),
      company: data.company.toString(),
      user,
      coll: 'driver',
      opType: 'create',
      body: JSON.stringify(data.toJSON()),
    })

    await data.populate('tkName')
    emitTo(data.company.toString(), 'driver:created', data)
    return data
  }

  async updateOne({ id, body, user }) {
    const data = await Driver.findByIdAndUpdate(id, body, {
      new: true,
    })
    await ChangeLogService.add({
      docId: data._id.toString(),
      company: data.company.toString(),
      user,
      coll: 'driver',
      opType: 'update',
      body: JSON.stringify(data.toJSON()),
    })
    await data.populate(['tkName'])
    emitTo(data.company.toString(), 'driver:updated', data)
    return data
  }

  async getByProfile(profile) {
    const data = await Driver.find({
      company: profile,
      isActive: true,
    }).populate('tkName')
    return data
  }

  async search({ search, profile }) {
    const query = {
      isActive: true,
      surname: new RegExp(search, 'i'),
    }
    if (profile) query.company = profile
    const data = await Driver.find(query).populate('tkName').lean()
    return data
  }

  async getById(id) {
    const data = await Driver.findById(id).populate('tkName').lean()
    return data
  }

  async deleteById({ id, user }) {
    const data = await Driver.findByIdAndUpdate(id, { isActive: false })
    await ChangeLogService.add({
      docId: data._id.toString(),
      company: data.company.toString(),
      user,
      coll: 'driver',
      opType: 'delete',
      body: JSON.stringify(data.toJSON()),
    })
    emitTo(data.company.toString(), 'driver:deleted', id)
    return data
  }
}

export default new DriverService()
