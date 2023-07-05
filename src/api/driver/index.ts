// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
import { getProfileDriversSchema, createDriverSchema } from './schemes.js'
import ctrl from '../../controllers/driver.controller.js'

const router = express.Router()

// api/driver
router.get('/', [jwtAuth, queryValidator(getProfileDriversSchema)], (...args) =>
  ctrl.getByProfile(...args)
)

router.get('/search', [jwtAuth], (...args) => ctrl.search(...args))

router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post('/', [jwtAuth, bodyValidator(createDriverSchema)], (...args) =>
  ctrl.create(...args)
)

router.put('/:id', [jwtAuth, bodyValidator(createDriverSchema)], (...args) =>
  ctrl.updateOne(...args)
)

router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
