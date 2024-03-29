// @ts-nocheck
import { TkNameService as service, PermissionService } from '../services'

export const create = async (req, res) => {
  try {
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'tkName:write',
    })
    const data = await service.create({ body: req.body, user: req.userId })
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
      operation: 'tkName:write',
    })
    const data = await service.updateOne({
      id: req.params.id,
      body: req.body,
      user: req.userId,
    })
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

export const getProfileTkNames = async (req, res) => {
  try {
    const data = await service.getByProfile(req.query.profile)
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

export const search = async (req, res) => {
  try {
    const data = await service.search({
      search: req.query.querySearch,
      profile: req.query.profile,
    })
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

export const getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id)
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

export const deleteById = async (req, res) => {
  try {
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'tkName:delete',
    })
    const data = await service.deleteById({
      id: req.params.id,
      user: req.userId,
    })
    res.status(200).json(data)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

//
