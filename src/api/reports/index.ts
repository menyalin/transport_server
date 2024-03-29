// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware'
import { queryValidator, bodyValidator } from '../../utils/validator'
import ctrl from '../../controllers/report.controller'
import {
  daysControlSchema,
  driversGradesSchema,
  grossProfitSchema,
  grossProfitPivotSchema,
  grossProfitDetailsSchema,
  orderDocsSchema,
} from './schemes'

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

router.post(
  '/drivers_grades',
  [jwtAuth, bodyValidator(driversGradesSchema)],
  (...args) => ctrl.driversGradesXlsxReport(...args)
)

router.post(
  '/gross_profit',
  [jwtAuth, bodyValidator(grossProfitSchema)],
  (...args) => ctrl.grossProfit(...args)
)

router.post(
  '/gross_profit_pivot',
  [jwtAuth, bodyValidator(grossProfitPivotSchema)],
  (...args) => ctrl.grossProfitPivot(...args)
)

router.post(
  '/gross_profit_details',
  [jwtAuth, bodyValidator(grossProfitDetailsSchema)],
  (...args) => ctrl.grossProfitDetails(...args)
)

router.post(
  '/order_docs',
  [jwtAuth, bodyValidator(orderDocsSchema)],
  (...args) => ctrl.orderDocs(...args)
)
router.post(
  '/orders_wo_invoice',
  [jwtAuth, bodyValidator(orderDocsSchema)],
  (...args) => ctrl.ordersWOInvoice(...args)
)

export default router
