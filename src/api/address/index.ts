// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '@/utils/auth.middleware'
import { queryValidator, bodyValidator } from '@/utils/validator'
import {
  getById,
  searchAddress,
  createAddress,
  updateAddress,
  getSuggestions,
  getProfileAddresses,
  deleteById,
} from '../../controllers/address.controllers'

import {
  getSuggestionsSchema,
  getProfileAddressesSchema,
  createAddressSchema,
} from './schemes'

const router = express.Router()
// api/addresses
router.post('/', [jwtAuth, bodyValidator(createAddressSchema)], createAddress)
router.put('/:id', [jwtAuth, bodyValidator(createAddressSchema)], updateAddress)
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
