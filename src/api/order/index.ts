// @ts-nocheck

import express from 'express'

import { jwtAuth } from '@/utils/auth.middleware'
import requestIdMiddleware from '@/utils/requestId.middleware'
import { queryValidator, bodyValidator } from '@/utils/validator'
import ctrl from '../../controllers/order.controller'
import {
  createSchema,
  getListSchema,
  getListForScheduleSchema,
  saveFinalPricesSchema,
  setDocsSchema,
  setDocsStateSchema,
  autoSetRouteDatesSchema,
} from './schemes'

const router = express.Router()

// api/orders
router.get('/', [jwtAuth, queryValidator(getListSchema)], ctrl.getList)
router.get(
  '/schedule',
  [jwtAuth, queryValidator(getListForScheduleSchema)],
  ctrl.getListForSchedule
)
router.get('/allowed_print_forms', [jwtAuth], (...args) =>
  ctrl.getAllowedPrintForms(...args)
)

router.get('/:id', [jwtAuth], ctrl.getById)

router.post('/:id/download_doc', [jwtAuth], (...args) =>
  ctrl.downloadDoc(...args)
)

router.post('/get_distance', [jwtAuth], ctrl.getDistance)
router.post('/from_template', [jwtAuth], ctrl.createFromTemplate)
router.post(
  '/auto_set_route_dates',
  [jwtAuth, bodyValidator(autoSetRouteDatesSchema)],
  ctrl.autoSetRouteDates
)

router.post(
  '/save_final_prices',
  [jwtAuth, bodyValidator(saveFinalPricesSchema)],
  ctrl.saveFinalPrices
)
router.post(
  '/',
  [jwtAuth, requestIdMiddleware, bodyValidator(createSchema)],
  ctrl.create
)

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
