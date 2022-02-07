/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
// import {
//   queryValidator
//   // bodyValidator
// } from '../../utils/validator.js'

// import { getListSchema } from './schemes.js'
import ctrl from '../../controllers/agreement.controller.js'

const router = express.Router()

// api/agreements
router.get('/', [jwtAuth], (...args) => ctrl.getList(...args))

router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
