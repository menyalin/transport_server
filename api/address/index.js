/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator, bodyValidator } from '../../utils/validator.js'
import {
  getById,
  searchAddress
} from '../../controllers/address.controllers.js'

import {
  getSuggestions,
  createAddress,
  updateAddress,
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
router.post('/', [jwtAuth, bodyValidator(createAddressSchema)], createAddress)
router.put(
  '/:id',
  [jwtAuth, bodyValidator(createAddressSchema)],
  updateAddress
)
router.get(
  '/get_suggestions',
  [jwtAuth, queryValidator(getSuggestionsSchema)],
  getSuggestions
)
router.get('/search', [jwtAuth], searchAddress)
router.get(
  '/',
  [jwtAuth, queryValidator(getProfileAddressesSchema)],
  getProfileAddresses
)
router.get('/:id', [jwtAuth], getById)
router.delete('/:id', [jwtAuth], deleteById)
export default router
