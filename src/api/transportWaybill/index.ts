import express, { Request, Response } from 'express'

import { jwtAuth } from '@/utils/auth.middleware'

import ctrl from '@/controllers/transportWaybill.controller'
import { AuthorizedRequest } from '@/controllers/interfaces'

const router = express.Router()

// api/transport_waybills

// (req: Request, res: Response) => ctrl.getList(req as AuthorizedRequest, res)

router.get('/', [jwtAuth], (req: Request, res: Response) =>
  ctrl.getList(req as AuthorizedRequest, res)
)
router.get('/:id', [jwtAuth], (req: Request, res: Response) =>
  ctrl.getById(req as AuthorizedRequest, res)
)
router.get('/order/:orderId', [jwtAuth], (req: Request, res: Response) =>
  ctrl.getByOrderId(req as AuthorizedRequest, res)
)

router.post('/', [jwtAuth], (req: Request, res: Response) =>
  ctrl.create(req as AuthorizedRequest, res)
)

router.put('/:id', [jwtAuth], (req: Request, res: Response) =>
  ctrl.updateOne(req as AuthorizedRequest, res)
)

router.delete('/:id', [jwtAuth], (req: Request, res: Response) =>
  ctrl.deleteById(req as AuthorizedRequest, res)
)

export default router
