// import axios from 'axios'
import { Crew } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import getActualCrewsPipeline from './getActualCrewsPipeline.js'
import getCrewByTruckPipeline from './getCrewByTruckPipeline.js'

class CrewService {
  async create(body, userId) {
    const newCrew = await Crew.create({ ...body, manager: userId || null })
    await newCrew.populate(['tkName', 'driver', 'manager'])

    emitTo(newCrew.company.toString(), 'crew:created', newCrew)
    return newCrew
  }

  async updateOne(id, body, userId) {
    const data = await Crew.findByIdAndUpdate(
      id,
      { ...body, manager: userId },
      { new: true }
    )
      .populate('tkName')
      .populate('driver')
      .populate('manager')
    emitTo(data.company.toString(), 'crew:updated', data)
    return data
  }

  async closeCrew(id, { endDate, userId }) {
    const crew = await Crew.findById(id)
      .populate('tkName')
      .populate('driver')
      .populate('manager')
    if (!crew) return null
    const idx = crew.transport.length - 1
    crew.endDate = crew.transport[idx].endDate || endDate
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

  async getOneByTruck(truck, date) {
    const pipeline = getCrewByTruckPipeline(truck, date)
    const newerCrew = await Crew.findOne({
      isActive: true,
      transport: {
        $elemMatch: {
          $or: [{ truck: truck }, { trailer: truck }],
          startDate: { $gte: new Date(date) }
        }
      }
    })
    if (newerCrew)
      throw new Error(
        'Нарушение последовательности использования транспорта. Создание записи невозможно'
      )
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
