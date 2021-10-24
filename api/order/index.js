/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
import ctrl from '../../controllers/order.controller.js'
import { createSchema } from './schemes.js'

const router = express.Router()

// api/orders
router.get('/', [jwtAuth], ctrl.getList)
// router.get('/search', [jwtAuth], search)
router.get('/:id', [jwtAuth], ctrl.getById)

router.post('/', [jwtAuth, bodyValidator(createSchema)], ctrl.create)
router.put('/:id', [jwtAuth, bodyValidator(createSchema)], ctrl.updateOne)
router.delete('/:id', [jwtAuth], ctrl.deleteById)

export default router
