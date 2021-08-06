/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
import { getById } from '../../controllers/address.controllers.js'

import {
  getSuggestions,
  createAddress,
  updateAddress,
  searchAddress,
  getProfileAddresses,
  deleteById
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

router.get('/:id', [jwtAuth], getById)

router.post('/', [jwtAuth, bodyValidator(createAddressSchema)], createAddress)
router.put(
  '/:id',
  [jwtAuth, bodyValidator(createAddressSchema)],
  updateAddress
)
router.delete('/:id', [jwtAuth], deleteById)
router.get('/search', searchAddress)

export default router
