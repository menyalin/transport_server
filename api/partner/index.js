/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
// import { queryValidator, bodyValidator } from '../../utils/validator.js'

// import { getProfileListSchema, createSchema } from './schemes.js'
import ctrl from '../../controllers/partner.controller.js'

const router = express.Router()

// api/partner
router.get('/', [jwtAuth], ctrl.getByProfile)
router.get('/:id', [jwtAuth], ctrl.getById)

router.post('/', [jwtAuth], ctrl.create)
router.put('/:id', [jwtAuth], ctrl.updateOne)
router.delete('/:id', [jwtAuth], ctrl.deleteById)

export default router
