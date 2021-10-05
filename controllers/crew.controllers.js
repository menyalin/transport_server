import { CrewService as service } from '../services/index.js'

export const create = async (req, res) => {
  try {
    const data = await service.create(req.body, req.userId)
    res.status(201).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const updateOne = async (req, res) => {
  try {
    const data = await service.updateOne(req.params.id, req.body, req.userId)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const closeCrew = async (req, res) => {
  let data
  try {
    if (req.body.type === 'crew') {
      data = await service.closeCrew(req.params.id, {
        endDate: req.body.endDate,
        userId: req.userId
      })
    } else if (req.body.type === 'transport') {
      data = await service.closeTransportItem(req.params.id, {
        endDate: req.body.endDate,
        userId: req.userId
      })
    }

    if (!data) res.status(400).json({ message: 'Bad params' })
    res.status(200).json(data)
  } catch (e) {
    if (e.message === 'bad query params')
      res.status(400).json({ message: e.message })
    else res.status(500).json({ message: e.message })
  }
}

export const getProfileDocs = async (req, res) => {
  try {
    const data = await service.getByProfile(req.query.profile)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getActualCrews = async (req, res) => {
  try {
    const data = await service.getActualCrews(
      req.query.profile,
      req.query.date
    )
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}
export const getByDriver = async (req, res) => {
  try {
    const data = await service.getOneByDriver(
      req.query.driver,
      req.query?.date
    )
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getByTruck = async (req, res) => {
  try {
    const data = await service.getOneByTruck(req.query.truck, req.query?.date)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const deleteById = async (req, res) => {
  try {
    const data = await service.deleteById(req.params.id)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const crewDiagramReport = async (req, res) => {
  try {
    const data = await service.crewDiagramReport(req.query)
    res.status(200).json(data)
  } catch (e) {
    if (e.message === 'bad query params')
      res.status(400).json({ message: e.message })
    else res.status(500).json({ message: e.message })
  }
}

//
