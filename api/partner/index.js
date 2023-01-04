/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
// import { queryValidator, bodyValidator } from '../../utils/validator.js'

// import { getProfileListSchema, createSchema } from './schemes.js'
import ctrl from '../../controllers/partner.controller.js'

const router = express.Router()

// api/partner
router.get('/', [jwtAuth], (...args) => ctrl.getByProfile(...args))
router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))
router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))



// places
router.post('/:partnerId/places', [jwtAuth], (...args) =>
  ctrl.addPlaceForTransferDocs(...args)
)
router.put('/:partnerId/places/:placeId', [jwtAuth], (...args) => ctrl.updatePlaceForTransferDocs(...args))
router.delete('/:partnerId/places/:placeId', [jwtAuth], (...args) =>
  ctrl.deletePlaceForTransferDocs(...args)
)


export default router
