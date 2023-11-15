// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware'
import {
  queryValidator,
  // bodyValidator
} from '../../utils/validator'

import { getListSchema, getForOrderSchema, getForClientSchema } from './schemes'
import ctrl from '../../controllers/agreement.controller'

const router = express.Router()

// api/agreements
router.get('/', [jwtAuth, queryValidator(getListSchema)], (...args) =>
  ctrl.getList(...args)
)
router.get(
  '/get_for_order',
  [jwtAuth, queryValidator(getForOrderSchema)],
  (...args) => ctrl.getForOrder(...args)
)
router.get(
  '/get_for_client',
  [jwtAuth, queryValidator(getForClientSchema)],
  (...args) => ctrl.getForClient(...args)
)

router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
