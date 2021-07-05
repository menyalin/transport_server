import { DriverService } from '../../services/index.js'

export const create = async (req, res) => {
  try {
    const data = await DriverService.create(req.body)
    res.status(201).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const updateOne = async (req, res) => {
  try {
    const data = await DriverService.updateOne(req.params.id, req.body)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getProfileDrivers = async (req, res) => {
  try {
    const data = await DriverService.getByProfile(req.query.profile)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getById = async (req, res) => {
  try {
    const data = await DriverService.getById(req.params.id)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const deleteById = async (req, res) => {
  try {
    const data = await DriverService.deleteById(req.params.id)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

//
