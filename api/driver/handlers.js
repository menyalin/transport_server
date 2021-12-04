import { DriverService } from '../../services/index.js'

export const create = async (req, res) => {
  try {
    const data = await DriverService.create({
      body: req.body,
      user: req.userId
    })
    res.status(201).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const updateOne = async (req, res) => {
  try {
    const data = await DriverService.updateOne({
      id: req.params.id,
      body: req.body,
      user: req.userId
    })
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

export const search = async (req, res) => {
  try {
    const data = await DriverService.search({
      search: req.query.querySearch,
      profile: req.query.profile
    })
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
    const data = await DriverService.deleteById({
      id: req.params.id,
      user: req.userId
    })
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

//
