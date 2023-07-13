// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'
import { jwtAuth } from '../../utils/auth.middleware'
// import { getProfileListSchema, createSchema } from './schemes'
// import { queryValidator, bodyValidator } from '../../utils/validator'

import ctrl from '../../controllers/globalSettings.controller'

const router = express.Router()

// api/admin
router.post('/settings', [jwtAuth], (...args) => ctrl.create(...args))

// router.get('/', [jwtAuth], (...args) => ctrl.getByProfile(...args))
// router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

// router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
// router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
