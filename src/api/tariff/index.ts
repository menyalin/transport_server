// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware'
import { bodyValidator, queryValidator } from '../../utils/validator'

import { getListSchema, getOrderPrePriceSchema } from './schemes'
import ctrl from '../../controllers/tariff.controller'

const router = express.Router()

// api/tariffs
router.get('/', [jwtAuth, queryValidator(getListSchema)], (...args) =>
  ctrl.getList(...args)
)

router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post(
  '/get_order_preprice',
  [jwtAuth, bodyValidator(getOrderPrePriceSchema)],
  (...args) => ctrl.getOrderPrePrice(...args)
)
router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
