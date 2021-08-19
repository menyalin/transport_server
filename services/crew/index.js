// import axios from 'axios'
import { Crew } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import getActualCrewsPipeline from './getActualCrewsPipeline.js'

class CrewService {
  async create(body, userId) {
    let data = await Crew.create({ ...body, manager: userId || null })
    data = await data
      .populate('tkName')
      .populate('driver')
      .populate('truck')
      .populate('trailer')
      .populate('manager')
      .execPopulate()
    emitTo(data.company.toString(), 'crew:created', data)
    return data
  }

  async updateOne(id, body, userId) {
    const data = await Crew.findByIdAndUpdate(
      id,
      { ...body, manager: userId },
      { new: true }
    )
      .populate('tkName')
      .populate('truck')
      .populate('trailer')
      .populate('driver')
      .populate('manager')
    emitTo(data.company.toString(), 'crew:updated', data)
    return data
  }

  async getActualCrews(profile, date) {
    const pipeline = getActualCrewsPipeline(profile, date)
    
    const data = await Crew.aggregate(pipeline)
    return data
  }

  async getByProfile(profile) {
    const data = await Crew.find({ company: profile, isActive: true })
      .populate('tkName')
      .populate('driver')
      .populate('truck')
      .populate('trailer')
      .populate('manager')
    return data
  }

  async getById(id) {
    const data = await Crew.findById(id)
      .populate('tkName')
      .populate('driver')
      .populate('truck')
      .populate('trailer')
      .populate('manager')
    return data
  }

  async deleteById(id) {
    const data = await Crew.findByIdAndDelete(id)
    emitTo(data.company.toString(), 'crew:deleted', id)
    return data
  }
}

export default new CrewService()
