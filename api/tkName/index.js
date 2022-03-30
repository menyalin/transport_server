/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'

import { getProfileListSchema, createSchema } from './schemes.js'
import {
  getById,
  search,
  getProfileTkNames,
  create,
  updateOne,
  deleteById,
} from '../../controllers/tkName.controllers.js'

const router = express.Router()

// api/tk_name
router.get(
  '/',
  [jwtAuth, queryValidator(getProfileListSchema)],
  getProfileTkNames,
)
router.get('/search', [jwtAuth], search)
router.get('/:id', [jwtAuth], getById)

router.post('/', [jwtAuth, bodyValidator(createSchema)], create)
router.put('/:id', [jwtAuth, bodyValidator(createSchema)], updateOne)
router.delete('/:id', [jwtAuth], deleteById)

export default router
