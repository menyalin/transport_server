import { Response } from 'express'
import { AuthorizedRequest } from './interfaces'
import {
  CrewService as service,
  PermissionService,
  FileService,
} from '@/services'
import { BadRequestError } from '@/helpers/errors'

export const create = async (req: AuthorizedRequest, res: Response) => {
  try {
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'crew:write',
    })
    const data = await service.create(req.body, req.userId)
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
      operation: 'crew:write',
    })
    const data = await service.updateOne(req.params.id, req.body, req.userId)
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const closeCrew = async (req: AuthorizedRequest, res: Response) => {
  try {
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'crew:write',
    })

    const data = await service.closeCrew(req.params.id, {
      endDate: req.body.endDate,
      userId: req.userId,
    })

    if (!data) res.status(400).json({ message: 'Bad params' })
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const getProfileDocs = async (req: AuthorizedRequest, res: Response) => {
  try {
    const data = await service.getList(req.query)
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const getActualCrews = async (req: AuthorizedRequest, res: Response) => {
  try {
    const data = await service.getActualCrews(req.query.profile)
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}
export const getByDriver = async (req: AuthorizedRequest, res: Response) => {
  try {
    const data = await service.getOneByDriverAndDate(req.query)
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const getByTruck = async (req: AuthorizedRequest, res: Response) => {
  try {
    const data = await service.getOneByTruck(req.query.truck)
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const getByTruckAndDate = async (
  req: AuthorizedRequest,
  res: Response
) => {
  try {
    const data = await service.getOneByTruckAndDate({
      truck: req.query.truck,
      date: req.query?.date,
    })
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const getById = async (req: AuthorizedRequest, res: Response) => {
  try {
    const id = req.params.id
    const forEdit = req.query.forEdit
    const data = await service.getById({ id, forEdit })
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
      operation: 'crew:delete',
    })
    const data = await service.deleteById({
      id: req.params.id,
      userId: req.userId,
    })
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const crewDiagramReport = async (
  req: AuthorizedRequest,
  res: Response
) => {
  try {
    const data = await service.crewDiagramReport(req.query)
    res.status(200).json(data)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}

export const getCrewListFile = async (
  req: AuthorizedRequest,
  res: Response
) => {
  try {
    const items = await service.getCrewUnwindedData(req.query)
    const stream = await FileService.createExcelFile(
      items.map((i) => ({
        _id: i._id?.toString(),
        ['Перевозчик']: i.carrierName,
        ['Начало смены']: i.startDate,
        ['Конец смены']: i.endDate,
        ['Водитель']: i.driverFullName,
        ['Грузовик']: i.truckNumber,
        ['Прицеп']: i.trailerNumber,
        ['Транспорт.Начало смены']: i.transportStartDate,
        ['Транспорт.Конец смены']: i.transportEndDate,
        ['Примечание']: i.note,
      }))
    )

    res.status(200)
    stream.pipe(res)
  } catch (e) {
    if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
    else res.status(500).json(e)
  }
}
