/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
import {
  create,
  updateOne,
  getProfileDrivers,
  getById,
  deleteById
} from './handlers.js'
import { getProfileDriversSchema, createDriverSchema } from './schemes.js'

const router = express.Router()

// api/driver
router.get(
  '/',
  [jwtAuth, queryValidator(getProfileDriversSchema)],
  getProfileDrivers
)

router.get('/:id', [jwtAuth], getById)

router.post('/', [jwtAuth, bodyValidator(createDriverSchema)], create)
router.put('/:id', [jwtAuth, bodyValidator(createDriverSchema)], updateOne)
router.delete('/:id', [jwtAuth], deleteById)

export default router
