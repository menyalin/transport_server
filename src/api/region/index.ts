// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware'
// import { queryValidator, bodyValidator } from '../../utils/validator'

// import { getProfileListSchema, createSchema } from './schemes'
import ctrl from '../../controllers/region.controller'

const router = express.Router()

// api/regions
router.get('/', [jwtAuth], (...args) => ctrl.getByProfile(...args))
router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
