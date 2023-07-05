// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
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
} from '../../controllers/crew.controllers.js'
import {
  getListSchema,
  createDocSchema,
  getActualCrewsSchema,
  getByDriverScheme,
  getByTruckScheme,
  closeCrewSchema,
} from './schemes.js'

const router = express.Router()

// api/crews
router.get('/', [jwtAuth, queryValidator(getListSchema)], getProfileDocs)
router.get(
  '/actual',
  [jwtAuth, queryValidator(getActualCrewsSchema)],
  getActualCrews,
)
router.get(
  '/by_driver',
  [jwtAuth, queryValidator(getByDriverScheme)],
  getByDriver,
)
router.get('/by_truck', [jwtAuth], getByTruck)

router.get(
  '/by_truck_and_date',
  [jwtAuth, queryValidator(getByTruckScheme)],
  getByTruckAndDate,
)
router.get('/reports/crew_diagram', [], crewDiagramReport)

router.get('/:id', [jwtAuth], getById)
router.post('/', [jwtAuth, bodyValidator(createDocSchema)], create)
router.put('/close/:id', [jwtAuth, bodyValidator(closeCrewSchema)], closeCrew)
router.put('/:id', [jwtAuth, bodyValidator(createDocSchema)], updateOne)
router.delete('/:id', [jwtAuth], deleteById)

export default router
