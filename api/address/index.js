/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator } from '../../utils/validator.js'
import { getSuggestions } from './handlers.js'
import { getSuggestionsSchema } from './schemes.js'

const router = express.Router()

// api/addresses
router.get(
  '/get_suggestions',
  [jwtAuth, queryValidator(getSuggestionsSchema)],
  getSuggestions
)

export default router
