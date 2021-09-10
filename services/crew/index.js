// import axios from 'axios'
import { Crew } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import getActualCrewsPipeline from './getActualCrewsPipeline.js'
import getCrewByTruckPipeline from './getCrewByTruckPipeline.js'

class CrewService {
  async create(body, userId) {
    if (body.endDate) {
      const idx = body.transport.length - 1
      body.transport[idx].endDate = body.endDate
    }
    const newCrew = await Crew.create({ ...body, manager: userId || null })
    await newCrew.populate(['tkName', 'driver', 'manager'])

    emitTo(newCrew.company.toString(), 'crew:created', newCrew)
    return newCrew
  }

  async updateOne(id, body, userId) {
    let crew = await Crew.findById(id)
    if (!crew) return null
    if (body.endDate) {
      const idx = body.transport.length - 1
      if (body.transport[idx].endDate)
        body.endDate = body.transport[idx].endDate
      else body.transport[idx].endDate = body.endDate
    }

    crew = Object.assign(crew, { ...body, manager: userId })

    await crew.save()
    await crew.populate(['tkName', 'driver', 'manager'])
    emitTo(crew.company.toString(), 'crew:updated', crew)
    return crew
  }

  async closeCrew(id, { endDate, userId }) {
    const crew = await Crew.findById(id)
      .populate('tkName')
      .populate('driver')
      .populate('manager')
    if (!crew) return null
    const idx = crew.transport.length - 1

    if (crew.transport[idx].endDate) {
      crew.endDate = crew.transport[idx].endDate
    } else {
      crew.endDate = endDate
      crew.transport[idx].endDate = endDate
    }

    crew.manager = userId
    await crew.save()
    emitTo(crew.company.toString(), 'crew:updated', crew)
    return crew
  }

  async closeTransportItem(id, { endDate, userId }) {
    const crew = await Crew.findOne({ 'transport._id': id })
      .populate('tkName')
      .populate('driver')
      .populate('manager')
    if (!crew) return null
    const transportItem = crew.transport.find(
      (item) => item._id.toString() === id
    )
    transportItem.endDate = endDate
    crew.manager = userId
    await crew.save()
    emitTo(crew.company.toString(), 'crew:updated', crew)
    return crew
  }

  async getOneByDriver(driver, date) {
    if (date) {
      const data = await Crew.findOne({
        isActive: true,
        driver: driver,
        $or: [{ endDate: null }, { endDate: { $gte: new Date(date) } }]
      })
      return data
    } else {
      const data = await Crew.find({ isActive: true, driver })
        .sort({ startDate: -1 })
        .limit(1)
      return data ? data[0] : null
    }
  }

  async getOneByTruck(truck) {
    const pipeline = getCrewByTruckPipeline(truck)
    const data = await Crew.aggregate(pipeline)
    if (data.length) return data[0]
    else return null
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
      .populate('manager')
    return data
  }

  async getById(id) {
    const data = await Crew.findById(id)
      .populate('tkName')
      .populate('driver')
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