// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware'
// import { queryValidator, bodyValidator } from '../../utils/validator'

// import { getProfileListSchema, createSchema } from './schemes'
import ctrl from '../../controllers/partner.controller'

const router = express.Router()

// api/partner
router.get('/', [jwtAuth], (...args) => ctrl.getByProfile(...args))
router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))
router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

// places for transfer docs
router.post('/:partnerId/places', [jwtAuth], (...args) =>
  ctrl.addPlaceForTransferDocs(...args)
)
router.put('/:partnerId/places/:placeId', [jwtAuth], (...args) =>
  ctrl.updatePlaceForTransferDocs(...args)
)
router.delete('/:partnerId/places/:placeId', [jwtAuth], (...args) =>
  ctrl.deletePlaceForTransferDocs(...args)
)

export default router
