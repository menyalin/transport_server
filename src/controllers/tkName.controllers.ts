import { Response } from 'express'
import { CarrierService as service, PermissionService } from '../services'
import { AuthorizedRequest } from './interfaces'
import { BadRequestError } from '@/helpers/errors'

export const create = async (req: AuthorizedRequest, res: Response) => {
  try {
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'carrier:write',
    })
    const data = await service.create({ body: req.body, user: req.userId })
    res.status(201).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const updateOne = async (req: AuthorizedRequest, res: Response) => {
  try {
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'carrier:write',
    })
    const data = await service.updateOne({
      id: req.params.id,
      body: req.body,
      user: req.userId,
    })
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const getProfileCarriers = async (
  req: AuthorizedRequest,
  res: Response
) => {
  try {
    if (!req.query?.profile) throw new BadRequestError('Missing profil id')
    const data = await service.getByProfile(req.query?.profile.toString())
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const getById = async (req: AuthorizedRequest, res: Response) => {
  try {
    const data = await service.getById(req.params.id)
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const deleteById = async (req: AuthorizedRequest, res: Response) => {
  try {
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'carrier:delete',
    })
    const data = await service.deleteById({
      id: req.params.id,
      user: req.userId,
    })
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const getList = async (req: AuthorizedRequest, res: Response) => {
  try {
    const data = await service.getList(req.query)
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}
