import express, { Request, Response } from 'express'

import { jwtAuth } from '@/utils/auth.middleware'
import { queryValidator, bodyValidator } from '@/utils/validator'
import {
  create,
  updateOne,
  getProfileDocs,
  getById,
  deleteById,
  getActualCrews,
  getByDriver,
  getByTruck,
  closeCrew,
  crewDiagramReport,
  getByTruckAndDate,
  getCrewListFile,
} from '@/controllers/crew.controllers'
import {
  getListSchema,
  createDocSchema,
  getActualCrewsSchema,
  getByDriverScheme,
  getByTruckScheme,
  closeCrewSchema,
} from './schemes'
import { AuthorizedRequest } from '@/controllers/interfaces'

const router = express.Router()

// api/crews
router.get(
  '/',
  [jwtAuth, queryValidator(getListSchema)],
  (req: Request, res: Response) => getProfileDocs(req as AuthorizedRequest, res)
)

router.get(
  '/actual',
  [jwtAuth, queryValidator(getActualCrewsSchema)],
  (req: Request, res: Response) => getActualCrews(req as AuthorizedRequest, res)
)

router.get(
  '/download_list',
  [jwtAuth, queryValidator(getListSchema)],
  (req: Request, res: Response) =>
    getCrewListFile(req as AuthorizedRequest, res)
)

router.get(
  '/by_driver',
  [jwtAuth, queryValidator(getByDriverScheme)],
  (req: Request, res: Response) => getByDriver(req as AuthorizedRequest, res)
)
router.get('/by_truck', [jwtAuth], (req: Request, res: Response) =>
  getByTruck(req as AuthorizedRequest, res)
)

router.get(
  '/by_truck_and_date',
  [jwtAuth, queryValidator(getByTruckScheme)],
  (req: Request, res: Response) =>
    getByTruckAndDate(req as AuthorizedRequest, res)
)
router.get('/reports/crew_diagram', [jwtAuth], (req: Request, res: Response) =>
  crewDiagramReport(req as AuthorizedRequest, res)
)

router.get('/:id', [jwtAuth], (req: Request, res: Response) =>
  getById(req as AuthorizedRequest, res)
)
router.post(
  '/',
  [jwtAuth, bodyValidator(createDocSchema)],
  (req: Request, res: Response) => create(req as AuthorizedRequest, res)
)
router.put(
  '/close/:id',
  [jwtAuth, bodyValidator(closeCrewSchema)],
  (req: Request, res: Response) => closeCrew(req as AuthorizedRequest, res)
)
router.put(
  '/:id',
  [jwtAuth, bodyValidator(createDocSchema)],
  (req: Request, res: Response) => updateOne(req as AuthorizedRequest, res)
)
router.delete('/:id', [jwtAuth], (req: Request, res: Response) =>
  deleteById(req as AuthorizedRequest, res)
)

export default router
