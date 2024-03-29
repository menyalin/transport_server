import express, { Response, Request } from 'express'
import ctrl from '@/controllers/tariffContract.controller'

import { jwtAuth } from '../../utils/auth.middleware'
import { bodyValidator, queryValidator } from '../../utils/validator'

import { getListSchema, getOrderPrePriceSchema } from './schemes'
import { AuthorizedRequest } from '@/controllers/interfaces'

const router = express.Router()

// api/tariff_contracts
// router.get('/', [jwtAuth, queryValidator(getListSchema)], (...args) =>
//   ctrl.getList(...args)
// )

// router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))
router.post('/', [jwtAuth], (req: Request, res: Response) =>
  ctrl.create(req as AuthorizedRequest, res)
)
// router.post('/', [jwtAuth], (...args: any) => ctrl.create(...args))
// router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
// router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
