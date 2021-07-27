/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
import {
  create,
  updateOne,
  getProfileTrucks,
  getById,
  search,
  deleteById
} from './handlers.js'
import { getProfileTrucksSchema, createTruckSchema } from './schemes.js'

const router = express.Router()

// api/driver
router.get(
  '/',
  [jwtAuth, queryValidator(getProfileTrucksSchema)],
  getProfileTrucks
)
router.get('/search', [jwtAuth], search)
router.get('/:id', [jwtAuth], getById)

router.post('/', [jwtAuth, bodyValidator(createTruckSchema)], create)
router.put('/:id', [jwtAuth, bodyValidator(createTruckSchema)], updateOne)
router.delete('/:id', [jwtAuth], deleteById)

export default router
