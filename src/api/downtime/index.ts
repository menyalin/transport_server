// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware'
import {
  queryValidator,
  // bodyValidator
} from '../../utils/validator'

import { getListSchema, getListForSchedule } from './schemes'
import ctrl from '../../controllers/downtime.controller'

const router = express.Router()

// api/downtimes
router.get('/', [jwtAuth, queryValidator(getListSchema)], (...args) =>
  ctrl.getList(...args)
)
router.get(
  '/schedule',
  [jwtAuth, queryValidator(getListForSchedule)],
  (...args) => ctrl.getListForSchedule(...args)
)
router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
