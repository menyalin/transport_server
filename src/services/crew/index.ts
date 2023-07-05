// @ts-nocheck
import { Crew } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import { ChangeLogService } from '../index.js'
import isLastItem from './isLastItem.js'
import getActualCrewsPipeline from './pipelines/getActualCrewsPipeline.js'
import getCrewByTruckPipeline from './pipelines/getCrewByTruckPipeline.js'
import getCrewDiagramReportPipeline from './pipelines/getCrewDiagramReportPipeline.js'
import getCrewByTruckAndDatePipeline from './pipelines/getCrewByTruckAndDatePipeline.js'
import getLastCrewByDriverPipeline from './pipelines/getLastCrewByDriverPipeline.js'
import getCrewListPipeline from './pipelines/getCrewListPipeline.js'

class CrewService {
  async create(body, userId) {
    if (body.endDate) {
      const idx = body.transport.length - 1
      body.transport[idx].endDate = body.endDate
    }
    const newCrew = await Crew.create({ ...body, manager: userId || null })

    await ChangeLogService.add({
      docId: newCrew._id.toString(),
      company: newCrew.company.toString(),
      user: userId,
      coll: 'crews',
      body: JSON.stringify(newCrew.toJSON()),
      opType: 'create',
    })
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
    await ChangeLogService.add({
      docId: crew._id.toString(),
      company: crew.company.toString(),
      user: userId,
      coll: 'crews',
      body: JSON.stringify(crew.toJSON()),
      opType: 'update',
    })

    emitTo(crew.company.toString(), 'crew:updated', crew)
    return crew
  }

  async closeCrew(id, { endDate, userId }) {
    const crew = await Crew.findById(id)

    if (!crew) return null
    const idx = crew.transport.length - 1

    if (crew.transport[idx].endDate) {
      crew.endDate = crew.transport[idx].endDate
    } else {
      crew.endDate = endDate
      crew.transport[idx].endDate = endDate
    }
    if (
      new Date(crew.transport[idx].startDate) >
      new Date(crew.transport[idx].end)
    )
      throw new Error('bad query params')
    crew.manager = userId
    await crew.save()
    await ChangeLogService.add({
      docId: crew._id.toString(),
      company: crew.company.toString(),
      user: userId,
      coll: 'crews',
      body: JSON.stringify(crew.toJSON()),
      opType: 'update',
    })
    await crew.populate(['tkName', 'driver', 'manager'])
    emitTo(crew.company.toString(), 'crew:updated', crew)
    return crew
  }

  async closeTransportItem(id, { endDate, userId }) {
    const crew = await Crew.findOne({ 'transport._id': id })

    if (!crew) return null
    const transportItem = crew.transport.find(
      (item) => item._id.toString() === id,
    )
    if (new Date(transportItem.startDate) > new Date(endDate))
      throw new Error('bad query params')
    transportItem.endDate = endDate
    crew.manager = userId
    await crew.save()
    await ChangeLogService.add({
      docId: crew._id.toString(),
      company: crew.company.toString(),
      user: userId,
      coll: 'crews',
      body: JSON.stringify(crew.toJSON()),
      opType: 'update',
    })
    await crew.populate(['tkName', 'driver', 'manager'])
    emitTo(crew.company.toString(), 'crew:updated', crew)
    return crew
  }

  async getOneByDriver(driver) {
    const pipeline = getLastCrewByDriverPipeline(driver)
    const data = await Crew.aggregate(pipeline)
    if (data.length) return data[0]
    else return null
  }

  async getOneByTruck(truck) {
    const pipeline = getCrewByTruckPipeline(truck)
    const data = await Crew.aggregate(pipeline)
    if (data.length) return data[0]
    else return null
  }

  async getOneByTruckAndDate({ truck, date }) {
    const pipeline = getCrewByTruckAndDatePipeline({ truck, date })
    const data = await Crew.aggregate(pipeline)
    if (data.length) return data[0]
    else return null
  }

  async getActualCrews(profile) {
    const pipeline = getActualCrewsPipeline(profile)
    const data = await Crew.aggregate(pipeline)
    return data
  }

  async getList(params) {
    const pipeline = getCrewListPipeline(params)
    const data = await Crew.aggregate(pipeline)
    return data[0]
  }

  async getById({ id, forEdit }) {
    const data = await Crew.findById(id)
      .populate('tkName')
      .populate('driver')
      .populate('manager')
    const plainData = data.toObject()
    if (forEdit)
      plainData.editable = await isLastItem({ crew: data.toObject() })

    return plainData
  }

  async deleteById({ id, userId }) {
    const data = await Crew.findByIdAndDelete(id)
    emitTo(data.company.toString(), 'crew:deleted', id)
    await ChangeLogService.add({
      docId: data._id.toString(),
      company: data.company.toString(),
      user: userId,
      coll: 'crews',
      body: JSON.stringify(data.toJSON()),
      opType: 'delete',
    })

    return data
  }

  async crewDiagramReport(params) {
    const pipeline = getCrewDiagramReportPipeline(params)
    const data = await Crew.aggregate(pipeline)
    return data
  }
}

export default new CrewService()
