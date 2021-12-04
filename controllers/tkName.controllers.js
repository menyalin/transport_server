import { TkNameService as service } from '../services/index.js'

export const create = async (req, res) => {
  try {
    const data = await service.create({ body: req.body, user: req.userId })
    res.status(201).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const updateOne = async (req, res) => {
  try {
    const data = await service.updateOne({
      id: req.params.id,
      body: req.body,
      user: req.userId
    })
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getProfileTkNames = async (req, res) => {
  try {
    const data = await service.getByProfile(req.query.profile)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const search = async (req, res) => {
  try {
    const data = await service.search({
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
    const data = await service.getById(req.params.id)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const deleteById = async (req, res) => {
  try {
    const data = await service.deleteById({
      id: req.params.id,
      user: req.userId
    })
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

//
