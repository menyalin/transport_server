/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
import ctrl from '../../controllers/report.controller.js'
import { daysControlSchema, driversGradesSchema, grossProfitSchema } from './schemes.js'

const router = express.Router()

// api/reports
router.get(
  '/daysControl',
  [jwtAuth, queryValidator(daysControlSchema)],
  (...args) => ctrl.daysControl(...args),
)

router.get('/inProgressOrders', [jwtAuth], (...args) =>
  ctrl.inProgressOrders(...args),
)

router.get('/truckStateOnDate', [jwtAuth], (...args) =>
  ctrl.truckStateOnDate(...args),
)

router.post(
  '/drivers_grades',
  [jwtAuth, bodyValidator(driversGradesSchema)],
  (...args) => ctrl.driversGradesGetLink(...args),
)

router.post(
  '/gross_profit',
  [jwtAuth, bodyValidator(grossProfitSchema)],
  (...args) => ctrl.grossProfit(...args),
)
export default router
