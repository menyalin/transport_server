// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware'
import { bodyValidator, queryValidator } from '../../utils/validator'

import { getListSchema, getDriverSalarySchema } from './schemes'
import ctrl from '../../controllers/salaryTariff.controller'

const router = express.Router()

// api/salary_tariffs
router.get('/', [jwtAuth, queryValidator(getListSchema)], (...args) =>
  ctrl.getList(...args)
)
router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post(
  '/get_drivers_salary_by_period',
  [jwtAuth, bodyValidator(getDriverSalarySchema)],
  (...args) => ctrl.getDriversSalaryByPeriod(...args)
)

router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
