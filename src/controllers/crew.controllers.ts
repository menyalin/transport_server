// @ts-nocheck
import {
  CrewService as service,
  PermissionService,
} from '../services/index.js'

export const create = async (req, res) => {
  try {
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'crew:write',
    })
    const data = await service.create(req.body, req.userId)
    res.status(201).json(data)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

export const updateOne = async (req, res) => {
  try {
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'crew:write',
    })
    const data = await service.updateOne(req.params.id, req.body, req.userId)
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

export const closeCrew = async (req, res) => {
  await PermissionService.check({
    userId: req.userId,
    companyId: req.companyId,
    operation: 'crew:write',
  })
  let data
  try {
    if (req.body.type === 'crew') {
      data = await service.closeCrew(req.params.id, {
        endDate: req.body.endDate,
        userId: req.userId,
      })
    } else if (req.body.type === 'transport') {
      data = await service.closeTransportItem(req.params.id, {
        endDate: req.body.endDate,
        userId: req.userId,
      })
    }

    if (!data) res.status(400).json({ message: 'Bad params' })
    res.status(200).json(data)
  } catch (e) {
    if (e.message === 'bad query params') res.status(400).json(e.message)
    else res.status(e.statusCoode || 500).json(e.message)
  }
}

export const getProfileDocs = async (req, res) => {
  try {
    const data = await service.getList(req.query)
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCoode || 500).json(e.message)
  }
}

export const getActualCrews = async (req, res) => {
  try {
    const data = await service.getActualCrews(req.query.profile)
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCoode || 500).json(e.message)
  }
}
export const getByDriver = async (req, res) => {
  try {
    const data = await service.getOneByDriver(
      req.query.driver,
      req.query?.date,
    )
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCoode || 500).json(e.message)
  }
}

export const getByTruck = async (req, res) => {
  try {
    const data = await service.getOneByTruck(req.query.truck, req.query?.date)
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCoode || 500).json(e.message)
  }
}

export const getByTruckAndDate = async (req, res) => {
  try {
    const data = await service.getOneByTruckAndDate({
      truck: req.query.truck,
      date: req.query?.date,
    })
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCoode || 500).json(e.message)
  }
}

export const getById = async (req, res) => {
  try {
    const id = req.params.id
    const forEdit = req.query.forEdit
    const data = await service.getById({ id, forEdit })
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCoode || 500).json(e.message)
  }
}

export const deleteById = async (req, res) => {
  try {
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'crew:delete',
    })
    const data = await service.deleteById({
      id: req.params.id,
      userId: req.userId,
    })
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCoode || 500).json(e.message)
  }
}

export const crewDiagramReport = async (req, res) => {
  try {
    const data = await service.crewDiagramReport(req.query)
    res.status(200).json(data)
  } catch (e) {
    if (e.message === 'bad query params')
      res.status(400).json({ message: e.message })
    else res.status(e.statusCode || 500).json(e.message)
  }
}

//
