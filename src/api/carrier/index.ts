import express, { Request, Response } from 'express'
import { jwtAuth } from '@/utils/auth.middleware'
import { queryValidator, bodyValidator } from '@/utils/validator'
import { getProfileListSchema, createSchema } from './schemes'
import * as ctrl from '@/controllers/tkName.controllers'
import { AuthorizedRequest } from '@/controllers/interfaces'

const router = express.Router()

// api/carriers

router.get('/list', [jwtAuth], (req: Request, res: Response) =>
  ctrl.getList(req as AuthorizedRequest, res)
)

router.get('/:id', [jwtAuth], (req: Request, res: Response) =>
  ctrl.getById(req as AuthorizedRequest, res)
)

router.get(
  '/',
  [jwtAuth, queryValidator(getProfileListSchema)],
  (req: Request, res: Response) =>
    ctrl.getProfileCarriers(req as AuthorizedRequest, res)
)

router.post(
  '/',
  [jwtAuth, bodyValidator(createSchema)],
  (req: Request, res: Response) => ctrl.create(req as AuthorizedRequest, res)
)
router.put(
  '/:id',
  [jwtAuth, bodyValidator(createSchema)],
  (req: Request, res: Response) => ctrl.updateOne(req as AuthorizedRequest, res)
)
router.delete('/:id', [jwtAuth], (req: Request, res: Response) =>
  ctrl.deleteById(req as AuthorizedRequest, res)
)

export default router
