/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
import ctrl from '../../controllers/order.controller.js'
import {
  createSchema,
  getListSchema,
  getListForScheduleSchema,
  saveFinalPricesSchema,
  setDocsSchema,
  setDocsStateSchema,
  autoSetRouteDatesSchema,
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
router.post('/auto_set_route_dates', [jwtAuth, bodyValidator(autoSetRouteDatesSchema)], ctrl.autoSetRouteDates)

router.post(
  '/save_final_prices',
  [jwtAuth, bodyValidator(saveFinalPricesSchema)],
  ctrl.saveFinalPrices
)
router.post('/', [jwtAuth, bodyValidator(createSchema)], ctrl.create)

router.put(
  '/:id/setDocsState',
  [jwtAuth, bodyValidator(setDocsStateSchema)],
  ctrl.setDocsState
)

router.put(
  '/:id/setDocs',
  [jwtAuth, bodyValidator(setDocsSchema)],
  ctrl.setDocs
)
router.put('/:id', [jwtAuth], ctrl.updateOne)
router.delete('/:id', [jwtAuth], ctrl.deleteById)

export default router
