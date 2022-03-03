/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
import ctrl from '../../controllers/order.controller.js'
import {
  createSchema,
  getListSchema,
  getListForScheduleSchema
} from './schemes.js'

const router = express.Router()

// api/orders
router.get('/', [jwtAuth, queryValidator(getListSchema)], ctrl.getList)
router.get(
  '/schedule',
  [jwtAuth, queryValidator(getListForScheduleSchema)],
  ctrl.getListForSchedule
)
router.get('/:id', [jwtAuth], ctrl.getById)

router.post('/get_distance', [jwtAuth], ctrl.getDistance)
router.post('/from_template', [jwtAuth], ctrl.createFromTemplate)
router.post('/', [jwtAuth, bodyValidator(createSchema)], ctrl.create)

router.put('/:id', [jwtAuth], ctrl.updateOne)
router.delete('/:id', [jwtAuth], ctrl.deleteById)

export default router
