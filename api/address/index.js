/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
import {
  getSuggestions,
  createAddress,
  searchAddress,
  getProfileAddresses
} from './handlers.js'
import {
  getSuggestionsSchema,
  getProfileAddressesSchema,
  createAddressSchema
} from './schemes.js'

const router = express.Router()

// api/addresses
router.get(
  '/',
  [jwtAuth, queryValidator(getProfileAddressesSchema)],
  getProfileAddresses
)

router.get(
  '/get_suggestions',
  [jwtAuth, queryValidator(getSuggestionsSchema)],
  getSuggestions
)

router.post('/', [jwtAuth, bodyValidator(createAddressSchema)], createAddress)
router.get('/search', searchAddress)

export default router
