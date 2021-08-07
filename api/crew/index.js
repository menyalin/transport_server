/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
import {
  create,
  updateOne,
  getProfileDocs,
  getById,
  deleteById
} from '../../controllers/crew.controllers.js'
import { getProfileDocsSchema, createDocSchema } from './schemes.js'

const router = express.Router()

// api/crews
router.get(
  '/',
  [jwtAuth, queryValidator(getProfileDocsSchema)],
  getProfileDocs
)

router.get('/:id', [jwtAuth], getById)

router.post('/', [jwtAuth, bodyValidator(createDocSchema)], create)
router.put('/:id', [jwtAuth, bodyValidator(createDocSchema)], updateOne)
router.delete('/:id', [jwtAuth], deleteById)

export default router
