import express, { Response, Request } from 'express'
import ctrl from '@/controllers/tariffContract.controller'

import { jwtAuth } from '../../utils/auth.middleware'
import { bodyValidator, queryValidator } from '../../utils/validator'

import { getListSchema } from './schemes'
import { AuthorizedRequest } from '@/controllers/interfaces'

const router = express.Router()

// api/tariff_contracts

router.get(
  '/',
  [jwtAuth, queryValidator(getListSchema)],
  (req: Request, res: Response) => ctrl.getList(req as AuthorizedRequest, res)
)

router.get('/:id', [jwtAuth], (req: Request, res: Response) =>
  ctrl.getById(req as AuthorizedRequest, res)
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
