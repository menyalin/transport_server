// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '@/utils/auth.middleware'
import { queryValidator, bodyValidator } from '@/utils/validator'
import ctrl from '../../controllers/truck.controller'

import { getProfileTrucksSchema, createTruckSchema } from './schemes'

const router = express.Router()

// api/truck
router.get('/', [jwtAuth, queryValidator(getProfileTrucksSchema)], (...args) =>
  ctrl.getByProfile(...args)
)
router.get('/search', [jwtAuth], (...args) => ctrl.search(...args))
router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post('/', [jwtAuth, bodyValidator(createTruckSchema)], (...args) =>
  ctrl.create(...args)
)
router.put('/:id', [jwtAuth, bodyValidator(createTruckSchema)], (...args) =>
  ctrl.updateOne(...args)
)
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
