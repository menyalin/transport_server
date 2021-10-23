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
// router.get('/:id', [jwtAuth], getById)

router.post('/', [jwtAuth, bodyValidator(createSchema)], ctrl.create)
// router.put('/:id', [jwtAuth, bodyValidator(createDriverSchema)], updateOne)
// router.delete('/:id', [jwtAuth], deleteById)

export default router
