import express, { Request, Response } from 'express'
import { jwtAuth } from '@/utils/auth.middleware'
import ctrl from '@/controllers/carrierAgreement.controller'
import { AuthorizedRequest } from '@/controllers/interfaces'

const router = express.Router()

// api/carrier_agreements
router.get('/', [jwtAuth], (req: Request, res: Response) =>
  ctrl.getList(req as AuthorizedRequest, res)
)

router.get(
  '/get_by_carrier_and_date',
  [jwtAuth],
  (req: Request, res: Response) =>
    ctrl.getByCarrierAndDate(req as AuthorizedRequest, res)
)

router.get('/:id', [jwtAuth], (req: Request, res: Response) =>
  ctrl.getById(req as AuthorizedRequest, res)
)

router.post('/', [jwtAuth], (req: Request, res: Response) =>
  ctrl.create(req as AuthorizedRequest, res)
)
router.put('/:id', [jwtAuth], (req: Request, res: Response) =>
  ctrl.update(req as AuthorizedRequest, res)
)
router.delete('/:id', [jwtAuth], (req: Request, res: Response) =>
  ctrl.deleteById(req as AuthorizedRequest, res)
)

export default router
