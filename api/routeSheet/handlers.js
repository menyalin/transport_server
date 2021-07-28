import { RouteSheetService } from '../../services/index.js'

export const create = async (req, res) => {
  try {
    const data = await RouteSheetService.create(req.body, req.userId)
    res.status(201).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const updateOne = async (req, res) => {
  try {
    const data = await RouteSheetService.updateOne(
      req.params.id,
      req.body,
      req.userId
    )
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getProfileDocs = async (req, res) => {
  try {
    const data = await RouteSheetService.getByProfile(req.query.profile)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getById = async (req, res) => {
  try {
    const data = await RouteSheetService.getById(req.params.id)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const deleteById = async (req, res) => {
  try {
    const data = await RouteSheetService.deleteById(req.params.id)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

//
