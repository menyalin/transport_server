/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
import ctrl from '../../controllers/report.controller.js'
import { daysControlSchema } from './schemes.js'

const router = express.Router()

// api/reports
router.get(
  '/daysControl',
  [jwtAuth, queryValidator(daysControlSchema)],
  (...args) => ctrl.daysControl(...args)
)

router.get('/inProgressOrders', [jwtAuth], (...args) =>
  ctrl.inProgressOrders(...args)
)

router.get('/truckStateOnDate', [jwtAuth], (...args) =>
  ctrl.truckStateOnDate(...args)
)
export default router
