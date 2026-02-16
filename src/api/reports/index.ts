import express, { Response, Request } from 'express'

import { jwtAuth } from '@/utils/auth.middleware'
import { queryValidator, bodyValidator } from '@/utils/validator'
import ctrl, { ITruckStateOnDateProps } from '@/controllers/report.controller'
import {
  daysControlSchema,
  driversGradesSchema,
  grossProfitPivotSchema,
  grossProfitDetailsSchema,
  orderDocsSchema,
  truckStateOnDateSchema,
} from './schemes'
import { AuthorizedRequest } from '@/controllers/interfaces'

const router = express.Router()

// api/reports
router.get(
  '/daysControl',
  [jwtAuth, queryValidator(daysControlSchema)],
  (req: Request, res: Response) =>
    ctrl.daysControl(req as AuthorizedRequest, res)
)

router.get('/inProgressOrders', [jwtAuth], (req: Request, res: Response) =>
  ctrl.inProgressOrders(req as AuthorizedRequest, res)
)

router.get(
  '/truckStateOnDate',
  [jwtAuth, queryValidator(truckStateOnDateSchema)],
  (req: any, res: any) =>
    ctrl.truckStateOnDate(
      req as AuthorizedRequest<{}, {}, {}, ITruckStateOnDateProps>,
      res
    )
)

router.post(
  '/drivers_grades',
  [jwtAuth, bodyValidator(driversGradesSchema)],
  (req: Request, res: Response) =>
    ctrl.driversGradesXlsxReport(req as AuthorizedRequest, res)
)

router.post(
  '/gross_profit_pivot',
  [jwtAuth, bodyValidator(grossProfitPivotSchema)],
  (req: Request, res: Response) =>
    ctrl.grossProfitPivot(req as AuthorizedRequest, res)
)

router.post(
  '/gross_profit_details',
  [jwtAuth, bodyValidator(grossProfitDetailsSchema)],
  (req: Request, res: Response) =>
    ctrl.grossProfitDetails(req as AuthorizedRequest, res)
)

router.post(
  '/order_docs',
  [jwtAuth, bodyValidator(orderDocsSchema)],
  (req: Request, res: Response) => ctrl.orderDocs(req as AuthorizedRequest, res)
)
router.post(
  '/orders_wo_invoice',
  [jwtAuth, bodyValidator(orderDocsSchema)],
  (req: Request, res: Response) =>
    ctrl.ordersWOInvoice(req as AuthorizedRequest, res)
)

export default router
