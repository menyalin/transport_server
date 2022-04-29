/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { bodyValidator, queryValidator } from '../../utils/validator.js'

import { getListSchema, getOrderPrePriceSchema } from './schemes.js'
import ctrl from '../../controllers/tariff.controller.js'

const router = express.Router()

// api/tariffs
router.get('/', [jwtAuth, queryValidator(getListSchema)], (...args) =>
  ctrl.getList(...args),
)

router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post(
  '/get_order_preprice',
  [jwtAuth, bodyValidator(getOrderPrePriceSchema)],
  (...args) => ctrl.getOrderPrePrice(...args),
)
router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
