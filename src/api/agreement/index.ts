/* eslint-disable no-unused-vars */
import express, { Request, Response } from 'express'

import { jwtAuth } from '@/utils/auth.middleware'
import { queryValidator } from '@/utils/validator'

import { getListSchema, getForOrderSchema, getForClientSchema } from './schemes'
import ctrl from '@/controllers/agreement.controller'
import { AuthorizedRequest } from '@/controllers/interfaces'

const router = express.Router()

// api/agreements
router.get(
  '/',
  [jwtAuth, queryValidator(getListSchema)],
  (req: Request, res: Response) => ctrl.getList(req as AuthorizedRequest, res)
)
router.get(
  '/get_for_order',
  [jwtAuth, queryValidator(getForOrderSchema)],
  (req: Request, res: Response) =>
    ctrl.getForOrder(req as AuthorizedRequest, res)
)
router.get(
  '/get_for_client',
  [jwtAuth, queryValidator(getForClientSchema)],
  (req: Request, res: Response) =>
    ctrl.getForClient(req as AuthorizedRequest, res)
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
